import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageCircle, Mail, Phone, Smartphone } from "lucide-react";

const sourceIcon = { whatsapp: MessageCircle, email: Mail, phone: Phone, app: Smartphone } as const;

export const Route = createFileRoute("/staff/enquiries")({ component: EnquiriesPage });

function EnquiriesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () =>
      (await supabase.from("enquiries").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Enquiry updated");
      qc.invalidateQueries({ queryKey: ["enquiries"] });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
        <p className="text-sm text-muted-foreground">Leads coming in across all channels.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[160px]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((e) => {
              const Icon = sourceIcon[e.source as keyof typeof sourceIcon] ?? Smartphone;
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{e.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{e.contact ?? "—"}</TableCell>
                  <TableCell className="max-w-md text-sm">{e.message}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell>
                    <Select value={e.status} onValueChange={(v) => updateStatus(e.id, v)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
