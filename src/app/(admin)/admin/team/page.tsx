import { CreateAdminForm } from "@/components/admin/team/create-admin-form";
import { DeleteAdminButton } from "@/components/admin/team/delete-admin-button";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { listAdmins } from "@/services/admin-team.service";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default async function AdminTeamPage() {
  const session = await requireAdminSessionOrRedirect();
  const admins = await listAdmins();
  const currentUserId = session.user.id;
  const isLastAdmin = admins.length <= 1;

  return (
    <>
      <PageHeader
        eyebrow="Paramètres"
        title="Équipe"
        lede="Gérez les comptes administrateurs qui accèdent au back-office."
        meta={<PageMetaItem label="Administrateurs" value={admins.length} />}
      />

      <div className="space-y-6">
        <CreateAdminForm />

        <div className="overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
          <ul className="divide-y divide-[color:var(--admin-line)]">
            {admins.map((admin) => {
              const isSelf = admin.id === currentUserId;
              return (
                <li
                  key={admin.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--admin-accent)]/15 text-[0.75rem] font-semibold text-[color:var(--admin-accent)]">
                      {getInitials(admin.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-[0.875rem] font-medium text-[color:var(--admin-text)]">
                        {admin.name}
                        {isSelf && (
                          <span className="admin-pill bg-[color:var(--admin-surface)] text-[color:var(--admin-text-soft)]">
                            vous
                          </span>
                        )}
                      </p>
                      {admin.email && (
                        <p className="truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
                          {admin.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="admin-tabular hidden text-[0.75rem] text-[color:var(--admin-text-muted)] sm:block">
                      Ajouté le {formatDate(admin.createdAt)}
                    </span>
                    {/* Pas de suppression pour soi-même ni pour le dernier admin
                        restant : ces deux gardes sont aussi imposées côté serveur
                        (service), ici on retire simplement l'action de l'UI. */}
                    {isSelf || isLastAdmin ? (
                      <span
                        className="text-[0.75rem] text-[color:var(--admin-text-muted)]"
                        title={
                          isSelf
                            ? "Vous ne pouvez pas supprimer votre propre compte."
                            : "Impossible de supprimer le dernier administrateur."
                        }
                      >
                        —
                      </span>
                    ) : (
                      <DeleteAdminButton adminId={admin.id} adminName={admin.name} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
