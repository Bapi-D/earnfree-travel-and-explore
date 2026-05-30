import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RoleAccessPage } from "@/components/auth/RoleAccessPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Console — Earnfree" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleAccessPage
      title="Admin Login"
      description="Use the admin-only entry point to access the management console."
      credentialLabel="Username"
      credentialPlaceholder="admin"
      resolveEmail={(identifier) => {
        const value = identifier.trim().toLowerCase();
        if (value === "admin") return "admin@earnfree.com";
        if (value.includes("@")) return value;
        return `${value}@earnfree.com`;
      }}
      allowRole="admin"
    >
      <div className="min-h-screen flex bg-secondary/40">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </RoleAccessPage>
  );
}
