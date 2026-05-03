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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/staff/balances")({ component: BalancesPage });

function BalancesPage() {
  const { data } = useQuery({
    queryKey: ["balances"],
    queryFn: async () => {
      const { data: customers } = await supabase.from("customers").select("id,cid,full_name");
      const { data: payments } = await supabase.from("payments").select("customer_id,amount,type");
      return (customers ?? []).map((c) => {
        const rows = (payments ?? []).filter((p) => p.customer_id === c.id);
        const charged = rows
          .filter((p) => p.type === "charge")
          .reduce((s, p) => s + Number(p.amount), 0);
        const paid = rows
          .filter((p) => p.type === "payment")
          .reduce((s, p) => s + Number(p.amount), 0);
        return { ...c, charged, paid, outstanding: charged - paid };
      });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Balances</h1>
        <p className="text-sm text-muted-foreground">Per-customer financial overview.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Charged</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="w-[180px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.cid}</TableCell>
                <TableCell className="font-medium">{c.full_name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ₹{c.charged.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ₹{c.paid.toLocaleString()}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums font-medium ${c.outstanding > 0 ? "text-destructive" : "text-success"}`}
                >
                  ₹{c.outstanding.toLocaleString()}
                </TableCell>
                <TableCell>
                  <RecordPayment customerId={c.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RecordPayment({ customerId }: { customerId: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [type, setType] = useState("payment");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("payments").insert({
      customer_id: customerId,
      amount: Number(amount),
      method,
      type,
      note,
      recorded_by: user?.id,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Payment recorded");
      setOpen(false);
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Record entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment / charge</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment received</SelectItem>
                  <SelectItem value="charge">New charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Saving…" : "Save entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
