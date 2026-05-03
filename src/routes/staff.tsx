import { Link, Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useEffectiveRole, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Wrench, HeadphonesIcon, Wallet, Users, Video, ShieldUser, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/staff")({
  component: StaffLayout,
});

const NAV: { to: string; label: string; icon: typeof Briefcase; roles: AppRole[] }[] = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin","admin","accounts","service_eng","sales"] },
  { to: "/staff/jobs", label: "Job List", icon: Briefcase, roles: ["super_admin","admin","service_eng"] },
  { to: "/staff/services", label: "Service List", icon: Wrench, roles: ["super_admin","admin","service_eng"] },
  { to: "/staff/enquiries", label: "Enquiries", icon: HeadphonesIcon, roles: ["super_admin","admin","sales"] },
  { to: "/staff/balances", label: "Balances", icon: Wallet, roles: ["super_admin","admin","accounts"] },
  { to: "/staff/customers", label: "Customers", icon: Users, roles: ["super_admin","admin","accounts","sales","service_eng"] },
  { to: "/staff/videos", label: "Video Library", icon: Video, roles: ["super_admin","admin"] },
  { to: "/staff/staff", label: "Staff & Roles", icon: ShieldUser, roles: ["super_admin"] },
];

function StaffLayout() {
  const { user, loading, primaryRole, viewAs, setViewAs, signOut } = useAuth();
  const role = useEffectiveRole();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    else if (!loading && primaryRole === "customer") navigate({ to: "/app/services" });
  }, [loading, user, primaryRole, navigate]);

  if (loading || !user || !role || role === "customer") {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  const visible = NAV.filter((n) => n.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Wrench className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Volta</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <NavLinks visible={visible} pathname={loc.pathname} />
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
                <div className="flex items-center gap-2 px-5 py-5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="font-semibold tracking-tight">Volta</span>
                </div>
                <nav className="flex-1 space-y-1 px-3">
                  <NavLinks visible={visible} pathname={loc.pathname} />
                </nav>
                <div className="absolute bottom-0 w-full border-t border-sidebar-border p-3">
                  <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 md:hidden">
              <div className="grid h-7 w-7 place-items-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Volta</span>
            </div>

            <div className="hidden md:block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Role</div>
            <div className="text-sm font-medium capitalize">
              {role === "admin" || role === "super_admin" ? role.replace("_", " ") : 
               role === "customer" ? "User" : "Staff"}
            </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {primaryRole === "super_admin" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">View as</span>
                <Select value={viewAs ?? "super_admin"} onValueChange={(v) => setViewAs(v === "super_admin" ? null : (v as AppRole))}>
                  <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin (me)</SelectItem>
                    <SelectItem value="customer">User (app)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Link to="/app/services"><Button variant="outline" size="sm">Customer app</Button></Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}

function NavLinks({ visible, pathname }: { visible: any[]; pathname: string }) {
  return (
    <>
      {visible.map((n) => {
        const active = pathname === n.to || (n.to !== "/staff" && pathname.startsWith(n.to));
        return (
          <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}>
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </>
  );
}
