import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "./staff.index";

export const Route = createFileRoute("/app/history")({ component: History });

function History() {
  const { user } = useAuth();

  const { data: customer } = useQuery({
    queryKey: ["my-customer", user?.id],
    queryFn: async () => (await supabase.from("customers").select("*").eq("user_id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  const cid = customer?.id;

  const { data: purchases } = useQuery({
    queryKey: ["my-purchases", cid],
    enabled: !!cid,
    queryFn: async () => (await supabase.from("purchases").select("*").eq("customer_id", cid!).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: services } = useQuery({
    queryKey: ["my-services", cid],
    enabled: !!cid,
    queryFn: async () => (await supabase.from("services").select("*").eq("customer_id", cid!).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold tracking-tight">Your history</h1>
      <Tabs defaultValue="services" className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-4 space-y-3">
          {!services?.length && <Empty msg="No service requests yet." />}
          {services?.map((s) => (
            <div key={s.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{s.issue}</div>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              {s.preferred_date && <div className="mt-2 text-xs text-muted-foreground">Preferred: {s.preferred_date}</div>}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="purchases" className="mt-4 space-y-3">
          {!purchases?.length && <Empty msg="No purchases yet." />}
          {purchases?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <div className="font-medium">{p.item}</div>
                <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right tabular-nums font-semibold">₹{Number(p.amount).toLocaleString()}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{msg}</div>;
}
