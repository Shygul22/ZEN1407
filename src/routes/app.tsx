import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Wrench, History, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app")({ component: AppLayout });

const TABS = [
  { to: "/app/services", label: "Services", icon: Wrench },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/profile", label: "Profile", icon: User },
];

function AppLayout() {
  const { user, loading, primaryRole, viewAs, setViewAs } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
    );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Wrench className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Volta</span>
        </div>

        {primaryRole === "super_admin" && (
          <Select
            value={viewAs ?? "super_admin"}
            onValueChange={(v) => setViewAs(v === "super_admin" ? null : (v as AppRole))}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Boss</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="service_eng">Staff</SelectItem>
              <SelectItem value="customer">User</SelectItem>
            </SelectContent>
          </Select>
        )}
      </header>
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t bg-card/95 py-2 backdrop-blur">
        {TABS.map((t) => {
          const active = loc.pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
