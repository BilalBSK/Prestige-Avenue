import { AdminBreadcrumb } from "./admin-breadcrumb";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminUserMenu } from "./admin-user-menu";
import { AdminViewSiteButton } from "./admin-view-site";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.9)] sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <AdminMobileNav />
        <AdminBreadcrumb />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <AdminViewSiteButton />
        <span aria-hidden className="h-5 w-px bg-[color:var(--admin-line)]" />
        <AdminUserMenu name={userName} email={userEmail} />
      </div>
    </header>
  );
}
