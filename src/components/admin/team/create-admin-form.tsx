"use client";

import { Button } from "@/components/admin/ui/button";
import { Field } from "@/components/admin/ui/field";
import { Input } from "@/components/admin/ui/input";
import { toast } from "@/components/admin/ui/toast";
import { createAdminUser } from "@/server/admin/team.actions";
import { ADMIN_PASSWORD_MIN_LENGTH } from "@/server/admin/team.schema";
import { useRef, useState, useTransition } from "react";

/**
 * Génère un mot de passe fort et facile à transmettre : on évite les caractères
 * ambigus (O/0, l/1/I) pour qu'il se lise et se tape sans erreur. 18 caractères
 * tirés du `crypto` du navigateur — bien au-delà du minimum requis.
 */
function generatePassword(length = 18): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function CreateAdminForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Nom requis (2 caractères min.).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "E-mail invalide.";
    if (password.length < ADMIN_PASSWORD_MIN_LENGTH)
      next.password = `${ADMIN_PASSWORD_MIN_LENGTH} caractères minimum.`;
    return next;
  }

  function handleGenerate() {
    const pwd = generatePassword();
    setPassword(pwd);
    setShowPassword(true);
    setErrors((e) => ({ ...e, password: undefined }));
  }

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.info("Mot de passe copié dans le presse-papier.");
    } catch {
      toast.error("Copie impossible — sélectionnez le mot de passe manuellement.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    startTransition(async () => {
      try {
        await createAdminUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        toast.success(
          `Compte créé pour ${name.trim()}. Transmettez-lui ses identifiants.`,
        );
        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setErrors({});
        nameRef.current?.focus();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur lors de la création.";
        // Erreur d'unicité → on la rattache au champ e-mail pour guider l'œil.
        if (/e-mail/i.test(msg)) setErrors({ email: msg });
        toast.error(msg);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4 sm:p-5"
    >
      <h2 className="text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
        Ajouter un administrateur
      </h2>
      <p className="mt-1 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
        Le nouvel administrateur pourra se connecter avec son e-mail et le mot de
        passe que vous définissez ci-dessous.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="admin-name" required error={errors.name}>
          <Input
            id="admin-name"
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            autoComplete="off"
            error={!!errors.name}
            disabled={pending}
          />
        </Field>

        <Field label="E-mail" htmlFor="admin-email" required error={errors.email}>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@prestige-avenue.fr"
            autoComplete="off"
            error={!!errors.email}
            disabled={pending}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Mot de passe"
          htmlFor="admin-password"
          required
          error={errors.password}
          hint={`${ADMIN_PASSWORD_MIN_LENGTH} caractères minimum. Utilisez « Générer » pour un mot de passe fort.`}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                error={!!errors.password}
                disabled={pending}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer" : "Afficher"}
                className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-[color:var(--admin-text-muted)] transition-colors hover:text-[color:var(--admin-text)]"
                disabled={pending}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.25" />
                    <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.25" />
                    <path d="m3 3 10 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.25" />
                    <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.25" />
                  </svg>
                )}
              </button>
            </div>
            <Button type="button" variant="secondary" size="lg" onClick={handleGenerate} disabled={pending}>
              Générer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleCopy}
              disabled={pending || !password}
              aria-label="Copier le mot de passe"
            >
              Copier
            </Button>
          </div>
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit" variant="primary" size="lg" loading={pending}>
          Créer le compte
        </Button>
      </div>
    </form>
  );
}
