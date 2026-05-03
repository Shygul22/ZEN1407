import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function ServiceForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let { data: cust } = await supabase.from("customers").select("id").eq("user_id", user!.id).maybeSingle();
      if (!cust) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
        const ins = await supabase.from("customers").insert({
          cid: profile?.cid ?? `CID-${Math.floor(Math.random() * 99999)}`,
          full_name: profile?.full_name ?? "Customer",
          email: profile?.email, phone: profile?.phone, location: profile?.location,
          user_id: user!.id,
        }).select("id").single();
        cust = ins.data;
      }
      const { error } = await supabase.from("services").insert({
        customer_id: cust!.id, issue, description: desc, preferred_date: date || null,
      });
      if (error) throw error;
      toast.success("Service request submitted");
      if (onSuccess) onSuccess();
      else navigate({ to: "/app/history" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="issue">Issue</Label>
        <Input 
          id="issue" 
          required 
          value={issue} 
          onChange={(e) => setIssue(e.target.value)} 
          placeholder="e.g. AC not cooling" 
        />
      </div>
      <div>
        <Label htmlFor="desc">Description</Label>
        <Textarea 
          id="desc" 
          rows={4} 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
          placeholder="Describe what's happening" 
        />
      </div>
      <div>
        <Label htmlFor="date">Preferred date</Label>
        <Input 
          id="date" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
