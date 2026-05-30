import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarDays, Mail, Trash2, Upload, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  deleteAdminProfile,
  listAdminProfiles,
  type FirestoreUserProfileRow,
  uploadFirestoreProfileAttachment,
} from "@/lib/firebase-data";

export const Route = createFileRoute("/admin/profiles")({
  head: () => ({ meta: [{ title: "Admin Profiles — Earnfree" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminProfilesPage,
});

function AdminProfilesPage() {
  const queryClient = useQueryClient();
  const { isAdmin, user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<FirestoreUserProfileRow | null>(null);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => listAdminProfiles(),
    enabled: !!user && isAdmin,
    retry: false,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const refresh = () => {
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "earnfree-profile-changed") return;
      refresh();
    };

    window.addEventListener("earnfree-profile-changed", refresh);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("earnfree-profile-changed", refresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient, refetch]);

  const filtered = useMemo(() => data.filter((p) => {
    if (!search.trim()) return true;
    const t = search.trim().toLowerCase();
    return (p.full_name || "").toLowerCase().includes(t) || (p.email || "").toLowerCase().includes(t) || p.id.includes(t);
  }), [data, search]);

  const handleDeleteProfile = async (profile: FirestoreUserProfileRow) => {
    const confirmed = window.confirm(`Delete ${profile.full_name || profile.email || profile.id}? This removes the profile and related admin records.`);
    if (!confirmed) return;

    setDeletingId(profile.id);
    try {
      await deleteAdminProfile(profile.id);
      if (target?.id === profile.id) {
        setOpen(false);
        setTarget(null);
      }
      toast.success("Profile deleted");
      await queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user profiles and upload attachments to any profile.</p>
        </div>
        <div className="w-80">
          <Input placeholder="Search by name, email or uid" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-4 text-sm text-muted-foreground">
          You do not have admin privileges. Profiles will be visible to administrators only.
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-5 shadow-soft animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            No profiles found.
          </div>
        ) : (
          filtered.map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-background p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-charcoal truncate">{p.full_name || "—"}</div>
                  <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {p.email || "—"}
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                    <div>Phone: {p.phone || "—"}</div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Joined: {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTarget(p);
                      setOpen(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => void handleDeleteProfile(p)}
                    disabled={deletingId === p.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> {deletingId === p.id ? "Deleting" : "Delete"}
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <UploadDialog open={open} target={target} onOpenChange={setOpen} onUploaded={() => { setOpen(false); void queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }); }} />
    </div>
  );
}

function UploadDialog({ open, target, onOpenChange, onUploaded }: { open: boolean; target: FirestoreUserProfileRow | null; onOpenChange: (b: boolean) => void; onUploaded: () => void; }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!target || !file || !user) return;
    setBusy(true);
    try {
      await uploadFirestoreProfileAttachment(file, target.id, user.uid, title || file.name);
      toast.success("Uploaded to profile");
      setFile(null);
      setTitle("");
      onUploaded();
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload to {target?.full_name ?? "profile"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" />
          </div>
          <div className="space-y-1.5">
            <Label>File</Label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy || !file} className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]">{busy ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
