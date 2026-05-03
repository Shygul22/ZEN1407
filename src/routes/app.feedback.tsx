import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/feedback")({ component: Feedback });

function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: c } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (!c) {
      toast.error("No customer record");
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("feedback")
      .insert({ customer_id: c.id, rating, comment });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Thank you for your feedback!");
      navigate({ to: "/app/services" });
    }
  }

  return (
    <div className="p-5">
      <button
        onClick={() => navigate({ to: "/app/services" })}
        className="mb-4 inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold tracking-tight">Share your experience</h1>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)}>
              <Star
                className={`h-9 w-9 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
        <Textarea
          rows={5}
          placeholder="Tell us more (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Sending…" : "Submit feedback"}
        </Button>
      </form>
    </div>
  );
}
