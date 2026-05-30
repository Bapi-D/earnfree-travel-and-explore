import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, MessageSquare, Users, LogOut, Plane, MapPinned } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/destinations", label: "Destination", icon: MapPinned },
  { to: "/admin/profiles", label: "Profiles", icon: Users },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/admin/staff", label: "Staff", icon: Users },
];

export function AdminSidebar() {
  const { signOut, fullName, initials } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-charcoal text-white min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-gold flex items-center justify-center shadow-elegant">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display font-bold tracking-wide text-sm">EARNFREE</div>
          <div className="text-[10px] text-white/60 uppercase tracking-widest">Admin Console</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] text-white shadow-elegant"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{fullName || "Admin"}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">Administrator</div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-white/60 hover:text-primary"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
