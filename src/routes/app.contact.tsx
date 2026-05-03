import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/app/contact")({ component: Contact });

function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("enquiries").insert({
      name: name || user?.email, contact: contact || user?.email, source: "app", message,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Sent! Our team will reach out."); setMessage(""); navigate({ to: "/app/services" }); }
  }

  return (
    <div className="p-5">
      <button onClick={() => navigate({ to: "/app/services" })} className="mb-4 inline-flex items-center text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Back</button>
      <h1 className="text-2xl font-bold tracking-tight">Send us a message</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><Label>Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={user?.email ?? ""} /></div>
        <div><Label>Contact (phone or email)</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} /></div>
        <div><Label>Message</Label><Textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending…" : "Send message"}</Button>
      </form>
    </div>
  );
}
