import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./staff.index";

export const Route = createFileRoute("/staff/services")({ component: ServicesPage });

function ServicesPage() {
  const { data } = useQuery({
    queryKey: ["services"],
    queryFn: async () =>
      (
        await supabase
          .from("services")
          .select("*, customers(full_name, cid)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Service List</h1>
        <p className="text-sm text-muted-foreground">All service tickets and their status.</p>
      </div>
      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {data?.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {s.customers?.cid}
                </div>
                <h3 className="font-semibold text-primary">{s.customers?.full_name}</h3>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium">{s.issue}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4 text-[11px] text-muted-foreground">
              <span>Preferred Date:</span>
              <span className="font-medium text-foreground">{s.preferred_date ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.customers?.cid}</TableCell>
                <TableCell className="font-medium">{s.customers?.full_name}</TableCell>
                <TableCell>
                  {s.issue}
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </TableCell>
                <TableCell>{s.preferred_date ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
