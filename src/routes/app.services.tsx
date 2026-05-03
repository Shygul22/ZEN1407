import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, MessageCircle, Phone, Mail, Smartphone, CreditCard, Star, MessageSquarePlus } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ServiceForm } from "@/components/ServiceForm";

export const Route = createFileRoute("/app/services")({ component: ServicesHome });

function ServicesHome() {
  const [showContact, setShowContact] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6 pb-12">
      <VideoSlideshow />

      <header className="px-5">
        <h1 className="text-2xl font-bold tracking-tight">How can we help?</h1>
        <p className="text-sm text-muted-foreground">Request service or reach out.</p>
      </header>

      <div className="px-5">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button className="block w-full rounded-2xl p-5 text-left text-primary-foreground shadow-lg transition-transform active:scale-[0.98]" style={{ background: "var(--gradient-primary)" }}>
              <Wrench className="h-6 w-6" />
              <div className="mt-3 text-lg font-semibold">Register a service</div>
              <p className="mt-0.5 text-sm text-primary-foreground/85">Tell us what's not working and we'll send help.</p>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>Register a service</DrawerTitle>
                <DrawerDescription>Tell us what's not working and we'll send help.</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-10">
                <ServiceForm onSuccess={() => setOpen(false)} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {!showContact ? (
        <div className="px-5">
          <button 
            onClick={() => setShowContact(true)}
            className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:bg-accent/5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Need help?</div>
                <div className="text-xs text-muted-foreground">Reach out to our support team.</div>
              </div>
            </div>
            <div className="text-xs font-medium text-primary">Show options</div>
          </button>
        </div>
      ) : (
        <div className="px-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact us</div>
            <button onClick={() => setShowContact(false)} className="text-xs text-primary underline-offset-4 hover:underline">Hide</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ContactBtn href="https://wa.me/919876543210" icon={MessageCircle} label="WhatsApp" />
            <ContactBtn href="tel:+919876543210" icon={Phone} label="Phone" />
            <ContactBtn href="mailto:hello@volta.demo" icon={Mail} label="Email" />
            <Link to="/app/contact" className="rounded-xl border bg-card p-4 text-center"><Smartphone className="mx-auto h-5 w-5 text-primary" /><div className="mt-2 text-sm font-medium">In-app message</div></Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 px-5">
        <Link to="/app/payments" className="rounded-xl border bg-card p-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <div className="mt-2 text-sm font-medium">Payments</div>
          <div className="text-xs text-muted-foreground">Pay or view balance</div>
        </Link>
        <Link to="/app/feedback" className="rounded-xl border bg-card p-4">
          <Star className="h-5 w-5 text-warning" />
          <div className="mt-2 text-sm font-medium">Feedback</div>
          <div className="text-xs text-muted-foreground">Rate your experience</div>
        </Link>
      </div>
    </div>
  );
}

function VideoSlideshow() {
  const { data } = useQuery({
    queryKey: ["feed-videos"],
    queryFn: async () => (await supabase.from("videos").select("*").eq("visible", true).order("created_at", { ascending: false })).data ?? [],
  });
  const [idx, setIdx] = useState(0);
  const slides = data ?? [];

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const v = slides[idx];

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black md:h-80 md:aspect-auto">
      <video
        key={v.id}
        src={v.video_url}
        className="h-full w-full object-cover"
        autoPlay loop muted playsInline
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h2 className="text-base font-semibold text-white">{v.title}</h2>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/85">{v.description}</p>
        <Link to="/app/contact" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <MessageSquarePlus className="h-3.5 w-3.5" /> Enquire
        </Link>
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ContactBtn({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="rounded-xl border bg-card p-3 text-center sm:p-4">
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <div className="mt-2 text-sm font-medium">{label}</div>
    </a>
  );
}
