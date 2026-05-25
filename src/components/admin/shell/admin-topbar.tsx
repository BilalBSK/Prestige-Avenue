import { AdminBreadcrumb } from "./admin-breadcrumb";
import { AdminUserMenu } from "./admin-user-menu";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[color:var(--admin-line)] bg-[color:var(--admin-bg)]/85 px-6 backdrop-blur-md lg:px-8">
      <AdminBreadcrumb />
      <div className="flex items-center gap-3">
        <AdminUserMenu name={userName} email={userEmail} />
      </div>
    </header>
  );
}
