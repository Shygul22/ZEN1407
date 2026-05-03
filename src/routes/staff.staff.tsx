import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppRole } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/staff")({ component: StaffPage });

const ROLES: { value: AppRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "customer", label: "User" },
];

function getRoleLabel(role: string) {
  if (role === "service_eng" || role === "accounts" || role === "sales") return "Staff";
  if (role === "customer") return "User";
  return role.replace("_", " ");
}

function StaffPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      }));
    },
  });

  async function setRole(userId: string, newRole: AppRole) {
    // Remove existing roles, then insert new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) toast.error(error.message);
    else { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["staff-list"] }); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff & Roles</h1>
        <p className="text-sm text-muted-foreground">Assign roles to anyone who has signed up.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Current role</TableHead><TableHead className="w-[180px]">Set role</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="capitalize">
                  {u.roles.map(getRoleLabel).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <Select onValueChange={(v) => setRole(u.id, v as AppRole)}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Change role" /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Tip: to make yourself the boss for the demo, sign up, then run this SQL once: <code>insert into user_roles(user_id, role) values ('YOUR_UID', 'super_admin');</code></p>
    </div>
  );
}
