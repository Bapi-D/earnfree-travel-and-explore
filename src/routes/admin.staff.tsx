import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, UserCog, Power } from "lucide-react";
import { toast } from "sonner";
import { ConfirmEarn46 } from "@/components/admin/ConfirmEarn46";
import { firebaseAuth } from "@/integrations/firebase/client";
import {
  listFirestoreProfilesByIds,
  listFirestoreStaffProfiles,
  setFirestoreStaffActive,
  uploadFirestoreProfileAttachment,
} from "@/lib/firebase-data";

export const Route = createFileRoute("/admin/staff")({ component: StaffPage });

type StaffRow = {
  id: string;
  user_id: string;
  staff_number: number;
  active: boolean;
  created_at: string;
  profile?: { full_name: string; email: string; phone?: string } | null;
};

function StaffPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const staff = await listFirestoreStaffProfiles();
      const ids = staff.map((s) => s.user_id);
      const profiles = await listFirestoreProfilesByIds(ids);
      return staff.map((s) => ({
        ...s,
        profile: profiles.find((p) => p.id === s.user_id) ?? null,
      })) as StaffRow[];
    },
    retry: false,
  });

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<StaffRow | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<StaffRow | null>(null);

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the three-tier staff routing (Staff 1 → 2 → 3 → Admin).
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]"
        >
          <Plus className="h-4 w-4 mr-2" /> Add staff
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-card border border-border p-5 shadow-soft animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-secondary" />
                  <div className="h-4 w-32 rounded bg-secondary" />
                </div>
              </div>
              <div className="h-3 w-2/3 rounded bg-secondary" />
              <div className="h-3 w-1/2 rounded bg-secondary" />
              <div className="h-9 w-full rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((slot) => {
            const member = data.find((s) => s.staff_number === slot && s.active);
            return (
              <div key={slot} className="rounded-2xl bg-card border border-border p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-gold text-white font-bold flex items-center justify-center shadow-elegant">
                    {slot}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Slot {slot}
                    </div>
                    <div className="font-display font-bold text-charcoal">
                      {member?.profile?.full_name ||
                        (member ? (
                          "Unnamed staff"
                        ) : (
                          <span className="text-muted-foreground italic">Empty</span>
                        ))}
                    </div>
                  </div>
                </div>
                {member?.profile?.email && (
                  <div className="text-sm text-muted-foreground mt-3">{member.profile.email}</div>
                )}
                {member?.profile?.phone && (
                  <div className="text-sm text-muted-foreground">{member.profile.phone}</div>
                )}
                {member && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-destructive hover:bg-destructive/10"
                    onClick={() => setTarget(member)}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" /> Deactivate
                  </Button>
                )}
                {member && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setUploadTarget(member);
                      setUploadOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Upload file
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <UserCog className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-lg">All staff records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Slot</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.profile?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.profile?.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.profile?.phone ?? "—"}</td>
                  <td className="px-4 py-3">Staff {s.staff_number}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No staff yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (payload) => {
          try {
            const currentUser = firebaseAuth.currentUser;
            const idToken = currentUser ? await currentUser.getIdToken() : null;
            const adminApiKey = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;

            if (!idToken && !adminApiKey) {
              throw new Error("Sign in with a real Firebase admin account or set VITE_ADMIN_API_KEY for local development.");
            }

            const response = await fetch("/__admin/create-user", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                ...(idToken ? { authorization: `Bearer ${idToken}` } : {}),
                ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
              },
              body: JSON.stringify({
                email: payload.email,
                displayName: payload.full_name,
                role: "staff",
                phone: payload.phone,
                staff_number: payload.staff_number,
              }),
            });

            const result = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
            if (!response.ok) {
              throw new Error(result?.message ?? result?.error ?? "Failed to create staff");
            }

            toast.success("Staff added");
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["admin-staff"] });
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to add staff");
          }
        }}
      />

      <ConfirmEarn46
        open={!!target}
        title={`Deactivate ${target?.profile?.full_name ?? "staff"}?`}
        description="They will stop receiving new enquiries. Enter Earn#46 to confirm."
        onCancel={() => setTarget(null)}
        onConfirm={async (secret) => {
          if (!target) return;
          try {
            if (secret !== "Earn#46") {
              throw new Error("Secondary password required");
            }
            await setFirestoreStaffActive(target.id, false);
            toast.success("Staff deactivated");
            setTarget(null);
            qc.invalidateQueries({ queryKey: ["admin-staff"] });
          } catch (e: any) {
            toast.error(e?.message ?? "Failed");
          }
        }}
      />

      <UploadToProfileDialog
        open={uploadOpen}
        target={uploadTarget}
        onOpenChange={(v) => setUploadOpen(v)}
        onUploaded={() => {
          setUploadOpen(false);
          qc.invalidateQueries({ queryKey: ["admin-staff"] });
          qc.invalidateQueries({ queryKey: ["profile-files"] });
        }}
      />
    </div>
  );
}

function UploadToProfileDialog({
  open,
  target,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  target: StaffRow | null;
  onOpenChange: (b: boolean) => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!target || !file) return;
    setBusy(true);
    try {
      const admin = firebaseAuth.currentUser;
      const adminUid = admin ? admin.uid : "";
      await uploadFirestoreProfileAttachment(file, target.user_id, adminUid, title || file.name);
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
          <DialogTitle>Upload file to {target?.profile?.full_name ?? "user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title for the file" />
          </div>
          <div className="space-y-1.5">
            <Label>File</Label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !file} className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload to profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStaffDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onCreate: (p: {
    user_id: string;
    email: string;
    full_name: string;
    phone: string;
    staff_number: number;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({ user_id: "", email: "", full_name: "", phone: "", staff_number: "1" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onCreate({ ...form, staff_number: Number(form.staff_number) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            Create a Firestore staff record for an existing Firebase Auth user. Use the user's UID here.
          </div>
          <div className="space-y-1.5">
            <Label>Firebase UID</Label>
            <Input
              required
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              placeholder="Firebase Auth user UID"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Staff slot</Label>
            <Select
              value={form.staff_number}
              onValueChange={(v) => setForm({ ...form, staff_number: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Staff 1 (first responder)</SelectItem>
                <SelectItem value="2">Staff 2 (bypass tier)</SelectItem>
                <SelectItem value="3">Staff 3 (final tier)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
