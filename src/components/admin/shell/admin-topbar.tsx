import { AdminBreadcrumb } from "./admin-breadcrumb";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminUserMenu } from "./admin-user-menu";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--admin-line)] bg-[color:var(--admin-bg)]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <AdminMobileNav />
        <AdminBreadcrumb />
      </div>
      <div className="flex items-center gap-3">
        <AdminUserMenu name={userName} email={userEmail} />
      </div>
    </header>
  );
}
