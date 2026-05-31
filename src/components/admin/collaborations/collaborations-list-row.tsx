"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button-variants";
import { DeleteCollaborationButton } from "./delete-collaboration-button";
import { TogglePublishedSwitch } from "./toggle-published-switch";

export interface CollaborationRow {
  id: string;
  partnerName: string;
  partnerUrl: string | null;
  coverImage: string | null;
  photoCount: number;
  isPublished: boolean;
}

export function CollaborationsListRow({ row }: { row: CollaborationRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className="admin-row border-b border-[color:var(--admin-line)] last:border-0"
    >
      <td className="w-8 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text-soft)] active:cursor-grabbing"
          aria-label="Réordonner"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="3" r="1" fill="currentColor" />
            <circle cx="9" cy="3" r="1" fill="currentColor" />
            <circle cx="5" cy="7" r="1" fill="currentColor" />
            <circle cx="9" cy="7" r="1" fill="currentColor" />
            <circle cx="5" cy="11" r="1" fill="currentColor" />
            <circle cx="9" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>
      </td>
      <td className="w-12 px-2 py-2.5">
        <div className="relative aspect-[4/3] w-11 overflow-hidden rounded-md border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]">
          {row.coverImage && (
            <Image src={row.coverImage} alt="" fill sizes="44px" className="object-cover" />
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
          {row.partnerName}
        </div>
        {row.partnerUrl && (
          <div className="mt-0.5 truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
            <span className="admin-mono">{row.partnerUrl.replace(/^https?:\/\//, "")}</span>
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="admin-tabular text-[0.875rem] text-[color:var(--admin-text)]">
          {row.photoCount}
          <span className="ml-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">photo{row.photoCount > 1 ? "s" : ""}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-center">
          <TogglePublishedSwitch collaborationId={row.id} initial={row.isPublished} />
        </div>
      </td>
      <td className="w-20 px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/collaborations/${row.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Éditer
          </Link>
          <DeleteCollaborationButton collaborationId={row.id} partnerName={row.partnerName} />
        </div>
      </td>
    </tr>
  );
}

export function CollaborationsListCard({ row }: { row: CollaborationRow }) {
  return (
    <article className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-3">
      <div className="flex items-start gap-3">
        <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]">
          {row.coverImage && (
            <Image src={row.coverImage} alt="" fill sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
            {row.partnerName}
          </div>
          <div className="mt-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
            {row.photoCount} photo{row.photoCount > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color:var(--admin-line)] pt-3">
        <div>
          <div className="text-[0.6875rem] text-[color:var(--admin-text-muted)]">Publiée</div>
          <div className="mt-0.5">
            <TogglePublishedSwitch collaborationId={row.id} initial={row.isPublished} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/collaborations/${row.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Éditer
          </Link>
          <DeleteCollaborationButton collaborationId={row.id} partnerName={row.partnerName} />
        </div>
      </div>
    </article>
  );
}
