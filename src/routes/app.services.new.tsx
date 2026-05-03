import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, MessageCircle, Phone, Mail, Smartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ServiceForm } from "@/components/ServiceForm";

export const Route = createFileRoute("/app/services/new")({ component: NewService });

function NewService() {
  const navigate = useNavigate();

  return (
    <div className="p-5">
      <button onClick={() => navigate({ to: "/app/services" })} className="mb-4 inline-flex items-center text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Back</button>
      <h1 className="text-2xl font-bold tracking-tight">Register a service</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>

      <div className="mt-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Or contact us directly</div>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="rounded-xl border bg-card p-4 text-center">
            <MessageCircle className="mx-auto h-5 w-5 text-primary" />
            <div className="mt-2 text-sm font-medium">WhatsApp</div>
          </a>
          <a href="tel:+919876543210" className="rounded-xl border bg-card p-4 text-center">
            <Phone className="mx-auto h-5 w-5 text-primary" />
            <div className="mt-2 text-sm font-medium">Phone</div>
          </a>
          <a href="mailto:hello@volta.demo" className="rounded-xl border bg-card p-4 text-center">
            <Mail className="mx-auto h-5 w-5 text-primary" />
            <div className="mt-2 text-sm font-medium">Email</div>
          </a>
          <Link to="/app/contact" className="rounded-xl border bg-card p-4 text-center">
            <Smartphone className="mx-auto h-5 w-5 text-primary" />
            <div className="mt-2 text-sm font-medium">In-app message</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
