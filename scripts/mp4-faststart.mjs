// @ts-check
/**
 * MP4 faststart remuxer — pure Node, no re-encoding (quality is bit-identical).
 *
 * Moves the `moov` atom (the file's index) ahead of `mdat` so browsers can start
 * decoding from the first bytes instead of waiting for the whole file to arrive.
 * This is the same transform as `ffmpeg -movflags +faststart`, implemented from
 * scratch because ffmpeg isn't available on this machine.
 *
 * Background-loop videos shipped without faststart, which is exactly why they
 * stuttered in production (CDN latency) while the already-faststart first.mp4
 * played smoothly. See the project's video hero for context.
 *
 * Usage:
 *   node scripts/mp4-faststart.mjs --check  public/video/*.mp4   # report only
 *   node scripts/mp4-faststart.mjs          public/video/bg.mp4  # rewrite in place
 *
 * Safety: each file is parsed and the rewritten buffer is fully re-validated
 * (atom order + every chunk offset must land inside the relocated mdat) BEFORE
 * the original is overwritten. Anything unexpected aborts without touching disk.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

/** Atoms that contain child atoms we must recurse into to find offset tables. */
const CONTAINERS = new Set([
  "moov", "trak", "mdia", "minf", "stbl", "edts", "udta", "mvex",
]);

/**
 * Parse the sequence of MP4 boxes between [start, end).
 * @param {Buffer} buf
 * @param {number} start
 * @param {number} end
 * @returns {{ type: string, size: number, offset: number, headerSize: number }[]}
 */
function readBoxes(buf, start, end) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      // 64-bit "large size" stored in the 8 bytes after the type.
      size = Number(buf.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      // Box extends to the end of its container.
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) {
      throw new Error(`Corrupt box "${type}" at ${offset} (size ${size})`);
    }
    boxes.push({ type, size, offset, headerSize });
    offset += size;
  }
  return boxes;
}

/**
 * Add `delta` to every chunk offset in `stco`/`co64` tables found under [start,end).
 * @param {Buffer} buf  buffer to mutate (a private copy of the moov atom)
 * @param {number} start
 * @param {number} end
 * @param {number} delta
 */
function shiftChunkOffsets(buf, start, end, delta) {
  for (const box of readBoxes(buf, start, end)) {
    const body = box.offset + box.headerSize;
    if (box.type === "stco") {
      const count = buf.readUInt32BE(body + 4); // skip version+flags (4 bytes)
      let p = body + 8;
      for (let i = 0; i < count; i++) {
        buf.writeUInt32BE(buf.readUInt32BE(p) + delta, p);
        p += 4;
      }
    } else if (box.type === "co64") {
      const count = buf.readUInt32BE(body + 4);
      let p = body + 8;
      for (let i = 0; i < count; i++) {
        buf.writeBigUInt64BE(buf.readBigUInt64BE(p) + BigInt(delta), p);
        p += 8;
      }
    } else if (CONTAINERS.has(box.type)) {
      shiftChunkOffsets(buf, body, box.offset + box.size, delta);
    }
  }
}

/**
 * Collect every chunk offset (post-rewrite) for validation.
 * @param {Buffer} buf
 * @param {number} start
 * @param {number} end
 * @param {number[]} out
 */
function collectChunkOffsets(buf, start, end, out) {
  for (const box of readBoxes(buf, start, end)) {
    const body = box.offset + box.headerSize;
    if (box.type === "stco") {
      const count = buf.readUInt32BE(body + 4);
      for (let i = 0, p = body + 8; i < count; i++, p += 4) out.push(buf.readUInt32BE(p));
    } else if (box.type === "co64") {
      const count = buf.readUInt32BE(body + 4);
      for (let i = 0, p = body + 8; i < count; i++, p += 8) out.push(Number(buf.readBigUInt64BE(p)));
    } else if (CONTAINERS.has(box.type)) {
      collectChunkOffsets(buf, body, box.offset + box.size, out);
    }
  }
}

/**
 * @param {Buffer} input
 * @returns {{ status: "already" | "rewritten" | "skip", reason?: string, output?: Buffer }}
 */
function faststart(input) {
  const top = readBoxes(input, 0, input.length);
  const moov = top.find((b) => b.type === "moov");
  const mdat = top.find((b) => b.type === "mdat");
  const ftyp = top.find((b) => b.type === "ftyp");

  if (!moov || !mdat) return { status: "skip", reason: "no moov/mdat (not a standard MP4)" };
  if (moov.offset < mdat.offset) return { status: "already" };

  // Move moov to just after ftyp. Everything that was after ftyp (and isn't moov)
  // shifts forward by exactly moov.size, so every chunk offset gains that delta.
  const delta = moov.size;
  const moovCopy = Buffer.from(input.subarray(moov.offset, moov.offset + moov.size));
  shiftChunkOffsets(moovCopy, 0, moovCopy.length, delta);

  const head = ftyp ? input.subarray(ftyp.offset, ftyp.offset + ftyp.size) : Buffer.alloc(0);
  const restParts = top
    .filter((b) => b !== moov && b !== ftyp)
    .map((b) => input.subarray(b.offset, b.offset + b.size));

  const output = Buffer.concat([head, moovCopy, ...restParts]);

  // ---- Validate before trusting the result ----
  if (output.length !== input.length) {
    throw new Error(`size drift ${input.length} -> ${output.length}`);
  }
  const newTop = readBoxes(output, 0, output.length);
  const newMoov = newTop.find((b) => b.type === "moov");
  const newMdat = newTop.find((b) => b.type === "mdat");
  if (!newMoov || !newMdat || newMoov.offset > newMdat.offset) {
    throw new Error("moov not ahead of mdat after rewrite");
  }
  const mdatStart = newMdat.offset + newMdat.headerSize;
  const mdatEnd = newMdat.offset + newMdat.size;
  const offsets = [];
  collectChunkOffsets(output, newMoov.offset, newMoov.offset + newMoov.size, offsets);
  for (const off of offsets) {
    if (off < mdatStart || off > mdatEnd) {
      throw new Error(`chunk offset ${off} outside mdat [${mdatStart}, ${mdatEnd}]`);
    }
  }
  return { status: "rewritten", output };
}

// ---- CLI ----
const args = argv.slice(2);
const checkOnly = args.includes("--check");
const files = args.filter((a) => !a.startsWith("--"));

if (files.length === 0) {
  console.error("usage: node scripts/mp4-faststart.mjs [--check] <file.mp4> ...");
  process.exit(1);
}

let changed = 0;
for (const file of files) {
  const input = readFileSync(file);
  let result;
  try {
    result = faststart(input);
  } catch (err) {
    console.error(`✗ ${file}: ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
    continue;
  }
  if (result.status === "already") {
    console.log(`• ${file}: already faststart`);
  } else if (result.status === "skip") {
    console.log(`• ${file}: skipped (${result.reason})`);
  } else if (checkOnly) {
    console.log(`! ${file}: NEEDS faststart (validated rewrite ready)`);
    changed++;
  } else {
    writeFileSync(file, result.output);
    console.log(`✓ ${file}: rewritten with faststart (${input.length} bytes, lossless)`);
    changed++;
  }
}

if (checkOnly && changed > 0) {
  console.log(`\n${changed} file(s) need faststart. Re-run without --check to rewrite.`);
}
