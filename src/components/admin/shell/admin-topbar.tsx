import { AdminUserMenu } from "./admin-user-menu";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div className="text-sm text-zinc-400">Espace dirigeant</div>
      <AdminUserMenu name={userName} email={userEmail} />
    </header>
  );
}
