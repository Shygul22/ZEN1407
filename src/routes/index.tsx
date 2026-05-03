import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useEffectiveRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, HeadphonesIcon, ShieldCheck, Users, Video, Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Volta — Run sales, service & accounts in one place" },
      { name: "description", content: "An end-to-end platform for leadership, staff and customers." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const role = useEffectiveRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "customer") navigate({ to: "/app/services" });
      else navigate({ to: "/staff" });
    }
  }, [loading, user, role, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Wrench className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Volta</span>
        </div>
        <Link to="/auth"><Button variant="outline">Sign in</Button></Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Demo mode — every role unlocked</p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              The operating system for your <span className="text-primary">field service</span> business.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Track jobs, manage enquiries, balance the books and keep customers engaged — from the boss's desk to the engineer's hands.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth"><Button size="lg" className="gap-2">Get started <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
            </div>
          </div>

          <div className="relative rounded-2xl border bg-card p-6 shadow-2xl" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Briefcase, label: "Open jobs", value: "8" },
                { icon: HeadphonesIcon, label: "New enquiries", value: "6" },
                { icon: Users, label: "Active customers", value: "5" },
                { icon: Video, label: "Product videos", value: "4" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border bg-background p-4">
                  <s.icon className="h-5 w-5 text-primary" />
                  <div className="mt-3 text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Role-based control", desc: "Boss, Admin, Accounts, Service Eng & Sales — each with the right view." },
            { icon: Wrench, title: "End-to-end workflow", desc: "From enquiry to job to service ticket to payment — all linked by CID." },
            { icon: Video, title: "Customer engagement app", desc: "Vertical video feed, service requests, payment history & feedback." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
