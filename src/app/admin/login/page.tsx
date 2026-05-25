import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <div className="admin-theme flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--admin-accent)]/15 text-[0.875rem] font-semibold tracking-tight text-[color:var(--admin-accent)]">
            PA
          </div>
          <div className="text-center">
            <h1 className="text-[1.25rem] font-semibold text-[color:var(--admin-text)]">
              Accès administrateur
            </h1>
            <p className="mt-1 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
              Connexion réservée à l&apos;équipe Prestige Avenue.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-5">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
