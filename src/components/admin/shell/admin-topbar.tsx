import { AdminBreadcrumb } from "./admin-breadcrumb";
import { AdminUserMenu } from "./admin-user-menu";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="relative z-10 flex h-20 items-center justify-between border-b border-[color:var(--admin-line)] bg-[color:var(--admin-bg)]/60 px-6 backdrop-blur-[2px] md:px-10 lg:px-14">
      <AdminBreadcrumb />
      <div className="flex items-center gap-5">
        <span className="admin-mono hidden text-[0.65rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)] md:inline">
          Espace dirigeant
        </span>
        <span className="hidden h-4 w-px bg-[color:var(--admin-line-strong)] md:block" />
        <AdminUserMenu name={userName} email={userEmail} />
      </div>
    </header>
  );
}
