import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/staff/customers")({ component: CustomersPage });

function CustomersPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await supabase.from("customers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const filtered = (data ?? []).filter((c) => `${c.cid} ${c.full_name} ${c.email} ${c.phone} ${c.location}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers (CID Directory)</h1>
          <p className="text-sm text-muted-foreground">Searchable record of every customer.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search CID, name, phone…" className="pl-9" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-muted-foreground">{c.cid}</div>
            </div>
            <div className="mt-2 text-base font-semibold">{c.full_name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.location}</div>
            <div className="mt-3 space-y-0.5 text-xs text-muted-foreground">
              <div>📞 {c.phone}</div>
              <div>✉️ {c.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
