import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Upload, Eye, EyeOff, Trash2 } from "lucide-react";

export const Route = createFileRoute("/staff/videos")({ component: VideosPage });

function VideosPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => (await supabase.from("videos").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function toggle(id: string, visible: boolean) {
    await supabase.from("videos").update({ visible }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["videos"] });
  }
  async function remove(id: string) {
    await supabase.from("videos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["videos"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Video Library</h1>
          <p className="text-sm text-muted-foreground">Product videos shown in the customer feed.</p>
        </div>
        <UploadDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-xl border bg-card">
            <video src={v.video_url} className="aspect-video w-full bg-black object-cover" muted />
            <div className="p-4">
              <div className="font-medium">{v.title}</div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{v.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <button onClick={() => toggle(v.id, !v.visible)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  {v.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {v.visible ? "Visible" : "Hidden"}
                </button>
                <Button size="icon" variant="ghost" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadDialog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    let video_url = url;
    if (file) {
      const path = `${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("product-videos").upload(path, file, { upsert: false });
      if (up.error) { toast.error(up.error.message); setBusy(false); return; }
      const { data } = supabase.storage.from("product-videos").getPublicUrl(path);
      video_url = data.publicUrl;
    }
    if (!video_url) { toast.error("Upload a file or paste a video URL"); setBusy(false); return; }
    const { error } = await supabase.from("videos").insert({ title, description: desc, video_url, visible, uploaded_by: user?.id });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Video added"); setOpen(false); setTitle(""); setDesc(""); setUrl(""); setFile(null); qc.invalidateQueries({ queryKey: ["videos"] }); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Upload className="h-4 w-4" /> Upload video</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add product video</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
          <div><Label>Video file</Label><Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div><Label>or paste a video URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="cursor-pointer">Visible to customers</Label>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Save"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
