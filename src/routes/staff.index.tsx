import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, HeadphonesIcon, Users, Wallet, Wrench } from "lucide-react";

export const Route = createFileRoute("/staff/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [jobs, enq, cust, pay, svc] = await Promise.all([
        supabase.from("jobs").select("id,status"),
        supabase.from("enquiries").select("id,status"),
        supabase.from("customers").select("id"),
        supabase.from("payments").select("amount,type"),
        supabase.from("services").select("id,status"),
      ]);
      const outstanding = (pay.data ?? []).reduce((sum, p) => sum + (p.type === "charge" ? Number(p.amount) : -Number(p.amount)), 0);
      return {
        openJobs: (jobs.data ?? []).filter((j) => j.status !== "completed").length,
        newEnq: (enq.data ?? []).filter((e) => e.status === "new").length,
        customers: cust.data?.length ?? 0,
        outstanding,
        openSvc: (svc.data ?? []).filter((s) => s.status !== "completed").length,
      };
    },
  });

  const cards = [
    { label: "Open Jobs", value: data?.openJobs ?? "–", icon: Briefcase, tint: "text-primary" },
    { label: "Service Tickets", value: data?.openSvc ?? "–", icon: Wrench, tint: "text-success" },
    { label: "New Enquiries", value: data?.newEnq ?? "–", icon: HeadphonesIcon, tint: "text-warning" },
    { label: "Customers", value: data?.customers ?? "–", icon: Users, tint: "text-primary" },
    { label: "Outstanding", value: `₹${(data?.outstanding ?? 0).toLocaleString()}`, icon: Wallet, tint: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of operations across the business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <c.icon className={`h-5 w-5 ${c.tint}`} />
            <div className="mt-4 text-2xl font-semibold tabular-nums">{c.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentJobs />
        <RecentServices />
        <RecentEnquiries />
      </div>
    </div>
  );
}

function RecentJobs() {
  const { data } = useQuery({
    queryKey: ["recent-jobs"],
    queryFn: async () => (await supabase.from("jobs").select("id,cin,title,status,location").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Recent Jobs</h3>
      <div className="mt-3 divide-y">
        {data?.map((j) => (
          <div key={j.id} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <div className="font-medium">{j.title}</div>
              <div className="text-xs text-muted-foreground">{j.cin} · {j.location}</div>
            </div>
            <StatusBadge status={j.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentServices() {
  const { data } = useQuery({
    queryKey: ["recent-services"],
    queryFn: async () => (await supabase.from("services").select("*, customers(full_name)").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Service Tickets</h3>
      <div className="mt-3 divide-y">
        {data?.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <div className="font-medium">{s.customers?.full_name || "Customer"}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{s.issue}</div>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentEnquiries() {
  const { data } = useQuery({
    queryKey: ["recent-enq"],
    queryFn: async () => (await supabase.from("enquiries").select("id,name,source,message,status").order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Latest Enquiries</h3>
      <div className="mt-3 divide-y">
        {data?.map((e) => (
          <div key={e.id} className="py-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{e.name}</span>
              <span className="text-xs uppercase text-muted-foreground">{e.source}</span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{e.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-warning/15 text-warning-foreground border-warning/30",
    new: "bg-warning/15 text-warning-foreground border-warning/30",
    in_progress: "bg-primary/10 text-primary border-primary/30",
    assigned: "bg-accent text-accent-foreground border-accent",
    contacted: "bg-accent text-accent-foreground border-accent",
    completed: "bg-success/15 text-success border-success/30",
    closed: "bg-muted text-muted-foreground border-border",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status.replace("_"," ")}</span>;
}
