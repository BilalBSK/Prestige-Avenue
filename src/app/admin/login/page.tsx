import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <div className="lux-container max-w-md py-14">
      <h1 className="mb-2 text-4xl font-[family:var(--font-display)] text-white">Acces admin</h1>
      <p className="mb-6 text-zinc-400">Connexion reservee a l equipe Prestige Avenue.</p>
      <LoginForm />
    </div>
  );
}
