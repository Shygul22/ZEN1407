import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./staff.index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/jobs")({ component: JobsPage });

function JobsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => (await supabase.from("jobs").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Job updated"); qc.invalidateQueries({ queryKey: ["jobs"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Job List</h1>
        <p className="text-sm text-muted-foreground">All scheduled and ongoing jobs across the team.</p>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {isLoading && <div className="py-10 text-center text-muted-foreground">Loading…</div>}
        {data?.map((j) => (
          <div key={j.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground">{j.cin}</div>
                <h3 className="font-semibold">{j.title}</h3>
              </div>
              <StatusBadge status={j.status} />
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">Location:</span> {j.location}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">Contact:</span> {j.contact}
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Update Status</div>
              <Select value={j.status} onValueChange={(v) => updateStatus(j.id, v)}>
                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CIN</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[160px]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>}
            {data?.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-mono text-xs">{j.cin}</TableCell>
                <TableCell className="font-medium">{j.title}</TableCell>
                <TableCell className="text-muted-foreground">{j.location}</TableCell>
                <TableCell className="text-muted-foreground">{j.contact}</TableCell>
                <TableCell><StatusBadge status={j.status} /></TableCell>
                <TableCell>
                  <Select value={j.status} onValueChange={(v) => updateStatus(j.id, v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
