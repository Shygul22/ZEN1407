import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/payments")({ component: Payments });

function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["my-payments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: c } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!c) return { rows: [], outstanding: 0 };
      const { data: rows } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", c.id)
        .order("created_at", { ascending: false });
      const outstanding = (rows ?? []).reduce(
        (s, r) => s + (r.type === "charge" ? Number(r.amount) : -Number(r.amount)),
        0,
      );
      return { rows: rows ?? [], outstanding };
    },
  });

  return (
    <div className="p-5">
      <button
        onClick={() => navigate({ to: "/app/services" })}
        className="mb-4 inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

      <div
        className="mt-5 rounded-2xl p-5 text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Wallet className="h-5 w-5" />
        <div className="mt-3 text-xs uppercase tracking-wider text-primary-foreground/80">
          Outstanding
        </div>
        <div className="mt-1 text-3xl font-bold tabular-nums">
          ₹{(data?.outstanding ?? 0).toLocaleString()}
        </div>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => window.open("tel:+919876543210")}
        >
          Contact Accounts to settle
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Activity</h2>
        <div className="mt-2 divide-y rounded-xl border bg-card">
          {data?.rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium capitalize">
                  {r.type === "charge" ? "Charge" : "Payment"}
                  {r.method ? ` · ${r.method}` : ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <div
                className={`tabular-nums font-semibold ${r.type === "charge" ? "text-destructive" : "text-success"}`}
              >
                {r.type === "charge" ? "+" : "−"}₹{Number(r.amount).toLocaleString()}
              </div>
            </div>
          ))}
          {!data?.rows.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
