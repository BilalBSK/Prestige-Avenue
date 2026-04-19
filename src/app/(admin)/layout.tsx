import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { ConfirmDialogHost } from "@/components/admin/ui/confirm-dialog";
import { ToastProvider } from "@/components/admin/ui/toast";
import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSessionOrRedirect();

  return (
    <ToastProvider>
      <div className="admin-theme admin-vignette relative isolate flex min-h-screen">
        <div className="admin-grain" aria-hidden />
        <AdminSidebar />
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <AdminTopbar userName={session.user?.name} userEmail={session.user?.email} />
          <main className="flex-1 overflow-x-auto px-6 py-10 md:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
      <ConfirmDialogHost />
    </ToastProvider>
  );
}
