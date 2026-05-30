import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleAccessPage } from "@/components/auth/RoleAccessPage";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";

export const Route = createFileRoute("/staff1")({
  head: () => ({
    meta: [{ title: "Staff Login — Earnfree" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: StaffLoginPage,
});

function StaffLoginPage() {
  return (
    <RoleAccessPage
      title="Staff 1 Login"
      description="Use the staff-only entry point to access the internal portal."
      credentialLabel="Username"
      credentialPlaceholder="staff1"
      resolveEmail={(identifier) => {
        const value = identifier.trim().toLowerCase();
        if (value === "staff1") return "staff1@earnfree.com";
        if (value.includes("@")) return value;
        return `${value}@earnfree.com`;
      }}
      allowRole="staff"
    >
      <StaffPortal />
    </RoleAccessPage>
  );
}

function StaffPortal() {
  const { fullName, initials, staffNumber, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-gold text-white font-bold flex items-center justify-center text-lg shadow-elegant">
            {initials}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Staff portal
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal">
              Welcome{fullName ? `, ${fullName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              {staffNumber
                ? `You are signed in as Staff ${staffNumber}.`
                : "Your staff session is active."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="rounded-full bg-charcoal text-white hover:bg-charcoal/90">
            <Link to="/admin">
              <LayoutDashboard className="h-4 w-4 mr-2" /> Go to admin login
            </Link>
          </Button>
          <Button variant="outline" onClick={() => signOut()} className="rounded-full">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
