import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ConfirmEarn46 } from "@/components/admin/ConfirmEarn46";
import {
  createFirestorePackage,
  deleteFirestorePackage,
  getFirestoreAdminPackages,
  getFirestorePackages,
  type FirestorePackageRow,
  updateFirestorePackage,
  uploadFirestorePackageImage,
} from "@/lib/firebase-data";
import { packages as seededPackages } from "@/data/packages";

export const Route = createFileRoute("/admin/packages")({ component: PackagesPage });

function PackagesPage() {
  const qc = useQueryClient();
  const { data: pkgs = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      // helper to add a timeout so a hanging fetch doesn't keep the UI in loading forever
      const timeout = (ms: number) =>
        new Promise<null>((res) => setTimeout(() => res(null), ms));

      const work = (async () => {
        const [adminList, publicList] = await Promise.allSettled([
          getFirestoreAdminPackages(),
          getFirestorePackages(),
        ]);

        const adminPkgs: FirestorePackageRow[] =
          adminList.status === "fulfilled" ? adminList.value : [];

        const publicPkgs = publicList.status === "fulfilled" ? publicList.value : [];

        const mappedPublic = publicPkgs.map((p) => ({
          id: p.id,
          title: p.name,
          description: "",
          image_url: p.image || "",
          price: p.price,
          location: p.destination || "",
          duration: p.duration || "",
          category: p.category as FirestorePackageRow["category"],
          featured: false,
          rating: p.rating ?? 4.7,
          highlights: p.highlights ?? [],
          created_at: undefined,
        } as FirestorePackageRow));

        const mergedMap = new Map<string, FirestorePackageRow>();
        mappedPublic.forEach((p) => mergedMap.set(p.id, p));
        adminPkgs.forEach((p) => mergedMap.set(p.id, p));

        return Array.from(mergedMap.values()).sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      })();

      const raced = await Promise.race([work, timeout(6000)]);
      if (raced === null) {
        // timeout: throw to mark as error so UI can show refresh
        throw new Error("Package fetch timed out");
      }
      return raced as FirestorePackageRow[];
    },
    retry: false,
  });

  // Ensure we fetch packages on mount in case the query didn't run earlier
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["admin-packages"] });
  }, [qc]);

  // Client-only fallback: if React Query stays loading, do a direct fetch after a short delay
  const [clientPkgs, setClientPkgs] = useState<FirestorePackageRow[] | null>(null);
  const [clientErr, setClientErr] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(async () => {
      if (!mounted) return;
      if (!isLoading) return; // query resolved quickly
      try {
        const timeout = (ms: number) => new Promise<null>((res) => setTimeout(() => res(null), ms));
        const work = Promise.allSettled([getFirestoreAdminPackages(), getFirestorePackages()]);
        const raced = await Promise.race([work, timeout(4000)]);
        if (raced === null) {
          // fallback to seeded packages
          const mapped = seededPackages.map((p) => ({
            id: p.id,
            title: p.name,
            description: "",
            image_url: p.image,
            price: p.price,
            location: p.destination,
            duration: p.duration,
            category: p.category as FirestorePackageRow["category"],
            featured: false,
            rating: p.rating,
            highlights: p.highlights ?? [],
            created_at: undefined,
          } as FirestorePackageRow));
          setClientPkgs(mapped);
          return;
        }
        const [adminList, publicList] = raced as PromiseSettledResult<any>[];
        const adminPkgs: FirestorePackageRow[] = adminList.status === "fulfilled" ? adminList.value : [];
        const publicPkgs = publicList.status === "fulfilled" ? publicList.value : [];
        const mappedPublic = publicPkgs.map((p) => ({
          id: p.id,
          title: p.name,
          description: "",
          image_url: p.image || "",
          price: p.price,
          location: p.destination || "",
          duration: p.duration || "",
          category: p.category as FirestorePackageRow["category"],
          featured: false,
          rating: p.rating ?? 4.7,
          highlights: p.highlights ?? [],
          created_at: undefined,
        } as FirestorePackageRow));
        const mergedMap = new Map<string, FirestorePackageRow>();
        mappedPublic.forEach((p) => mergedMap.set(p.id, p));
        adminPkgs.forEach((p) => mergedMap.set(p.id, p));
        const merged = Array.from(mergedMap.values()).sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
        setClientPkgs(merged.length ? merged : seededPackages.map((p) => ({
          id: p.id,
          title: p.name,
          description: "",
          image_url: p.image,
          price: p.price,
          location: p.destination,
          duration: p.duration,
          category: p.category as FirestorePackageRow["category"],
          featured: false,
          rating: p.rating,
          highlights: p.highlights ?? [],
          created_at: undefined,
        } as FirestorePackageRow)));
      } catch (err: any) {
        setClientErr(err?.message ?? String(err));
        // fallback to seeded packages
        const mapped = seededPackages.map((p) => ({
          id: p.id,
          title: p.name,
          description: "",
          image_url: p.image,
          price: p.price,
          location: p.destination,
          duration: p.duration,
          category: p.category as FirestorePackageRow["category"],
          featured: false,
          rating: p.rating,
          highlights: p.highlights ?? [],
          created_at: undefined,
        } as FirestorePackageRow));
        setClientPkgs(mapped);
      }
    }, 1200);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [isLoading]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FirestorePackageRow | null>(null);
  const [delTarget, setDelTarget] = useState<FirestorePackageRow | null>(null);

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (p: FirestorePackageRow) => {
    setEditing(p);
    setOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit and remove travel packages.
          </p>
        </div>
        <Button onClick={onAdd} className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]">
          <Plus className="h-4 w-4 mr-2" /> New package
        </Button>
      </div>

      {isLoading && clientPkgs == null ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-card border border-border overflow-hidden shadow-soft animate-pulse">
              <div className="aspect-video bg-secondary" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
                <div className="h-3 w-full rounded bg-secondary" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 rounded bg-secondary" />
                  <div className="h-9 w-10 rounded bg-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError && clientPkgs == null ? (
        <div className="col-span-full text-center py-16">
          <p className="text-sm text-destructive mb-4">Failed to load packages: {String((error as any)?.message ?? "Unknown")}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-packages"] })}>
              Retry
            </Button>
            <Button onClick={() => qc.invalidateQueries({ queryKey: ["packages"] })} variant="outline">
              Refresh site list
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {(clientPkgs ?? pkgs).map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-elegant transition-all group"
            >
              <div className="aspect-video bg-secondary relative overflow-hidden">
                {p.image_url ? (
                    <img
                      src={getImageSrc(p.image_url)}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {p.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-charcoal text-[10px] font-bold uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-charcoal line-clamp-1">{p.title}</h3>
                  <span className="text-primary font-bold whitespace-nowrap">
                    ₹{Number(p.price).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {p.location} • {p.duration}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(p)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDelTarget(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {pkgs.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No packages yet. Click <strong>New package</strong> to add the first one.
            </div>
          )}
        </div>
      )}

      <PackageDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-packages"] });
          qc.invalidateQueries({ queryKey: ["packages"] });
        }}
      />

      <ConfirmEarn46
        open={!!delTarget}
        title={`Delete "${delTarget?.title}"?`}
        description="This permanently removes the package. Enter Earn#46 to confirm."
        onCancel={() => setDelTarget(null)}
        onConfirm={async (secret) => {
          if (!delTarget) return;
          try {
            if (secret !== "Earn#46") {
              throw new Error("Secondary password required");
            }
            await deleteFirestorePackage(delTarget.id);
            toast.success("Package deleted");
            setDelTarget(null);
            qc.invalidateQueries({ queryKey: ["admin-packages"] });
            qc.invalidateQueries({ queryKey: ["packages"] });
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to delete");
          }
        }}
      />
    </div>
  );
}

function getImageSrc(urlStr?: string) {
  if (!urlStr) return "";
  try {
    const u = new URL(urlStr);
    if (u.hostname && u.hostname.includes('firebasestorage.googleapis.com')) {
      // common firebase storage download URL: /v0/b/<bucket>/o?name=<encoded>
      const name = u.searchParams.get('name');
      if (name) return `/__admin/storage?name=${encodeURIComponent(name)}`;
      // sometimes path contains /o/<encoded-name>
      const m = u.pathname.match(/\/o\/(.+)$/);
      if (m && m[1]) {
        const decoded = decodeURIComponent(m[1]);
        return `/__admin/storage?name=${encodeURIComponent(decoded)}`;
      }
    }
  } catch {}
  return urlStr;
}

function PackageDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial: FirestorePackageRow | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<FirestorePackageRow>>(
    () =>
      initial ?? {
        title: "",
        description: "",
        image_url: "",
        price: 0,
        location: "",
        duration: "",
        category: "Domestic",
        featured: false,
        rating: 4.7,
      },
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          title: "",
          description: "",
          image_url: "",
          price: 0,
          location: "",
          duration: "",
          category: "Domestic",
          featured: false,
          rating: 4.7,
        },
      );
      setFile(null);
    }
  }, [open, initial]);

  const upload = async (): Promise<string | null> => {
    if (!file) return form.image_url ?? null;
    return uploadFirestorePackageImage(file);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const image_url = await upload();
      const payload = {
        title: form.title!,
        description: form.description ?? "",
        image_url: image_url ?? "",
        price: Number(form.price ?? 0),
        location: form.location ?? "",
        duration: form.duration ?? "",
        category: (form.category ?? "Domestic") as PackageRow["category"],
        featured: !!form.featured,
        rating: Number(form.rating ?? 4.7),
        highlights: [] as string[],
      };
      if (initial) {
        await updateFirestorePackage(initial.id, payload);
        toast.success("Package updated");
      } else {
        await createFirestorePackage(payload);
        toast.success("Package created");
      }
      onSaved();
      onOpenChange(false);
      setFile(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit package" : "New package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title</Label>
              <Input
                required
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Bali, Indonesia"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input
                value={form.duration ?? ""}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="5 nights / 6 days"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={form.price ?? 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category ?? "Domestic"}
                onValueChange={(v) => setForm({ ...form, category: v as FirestorePackageRow["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domestic">Domestic</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="Honeymoon">Honeymoon</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Destination image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {form.image_url && !file && (
                <img src={form.image_url} alt="" className="h-20 rounded-lg object-cover mt-2" />
              )}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="feat"
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="feat" className="cursor-pointer">
                Mark as featured
              </Label>
            </div>
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
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : initial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
