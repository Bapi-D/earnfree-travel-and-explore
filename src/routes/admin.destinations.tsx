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
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ConfirmEarn46 } from "@/components/admin/ConfirmEarn46";
import { PUBLIC_DESTINATIONS } from "@/data/destinations";
import {
  createFirestoreDestination,
  deleteFirestoreDestination,
  getFirestoreAdminDestinations,
  type FirestoreDestinationRow,
  updateFirestoreDestination,
  uploadFirestorePackageImage,
} from "@/lib/firebase-data";

export const Route = createFileRoute("/admin/destinations")({ component: DestinationsPage });

function DestinationsPage() {
  const qc = useQueryClient();
  const { data: destinations = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: () => getFirestoreAdminDestinations(),
    retry: false,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDestinationRow | null>(null);
  const [delTarget, setDelTarget] = useState<FirestoreDestinationRow | null>(null);

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (destination: FirestoreDestinationRow) => {
    setEditing(destination);
    setOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Destination</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit and remove destination cards shown on the public destinations page.
          </p>
        </div>
        <Button onClick={onAdd} className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]">
          <Plus className="h-4 w-4 mr-2" /> New destination
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground flex items-center justify-between gap-4">
        <div>
          Public destination cards are now sourced from the same data used on the destinations page.
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await Promise.all(PUBLIC_DESTINATIONS.map((destination) => createFirestoreDestination({
                title: destination.name,
                description: destination.description,
                image_url: destination.image,
                price: destination.minPrice,
                location: destination.region,
                duration: destination.duration,
                category: destination.category,
                featured: destination.name === "Bali",
                rating: 4.7,
                highlights: destination.highlights,
              })));
              toast.success("Imported public destinations");
              qc.invalidateQueries({ queryKey: ["admin-destinations"] });
              qc.invalidateQueries({ queryKey: ["destinations"] });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Import failed");
            }
          }}
        >
          Import public destinations
        </Button>
      </div>

      {isLoading ? (
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
      ) : isError ? (
        <div className="col-span-full text-center py-16">
          <p className="text-sm text-destructive mb-4">Failed to load destinations: {String((error as any)?.message ?? "Unknown")}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-destinations"] })}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-elegant transition-all group"
            >
              <div className="aspect-video bg-secondary relative overflow-hidden">
                {destination.image_url ? (
                  <img
                    src={getImageSrc(destination.image_url)}
                    alt={destination.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {destination.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-charcoal text-[10px] font-bold uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-charcoal line-clamp-1">{destination.name}</h3>
                  <span className="text-primary font-bold whitespace-nowrap">
                    ₹{Number(destination.min_price).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {destination.region} • {destination.duration}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{destination.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {destination.package_count} curated option{destination.package_count === 1 ? "" : "s"}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(destination)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDelTarget(destination)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {destinations.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No destinations yet. Click <strong>New destination</strong> to add the first one.
            </div>
          )}
        </div>
      )}

      <DestinationDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-destinations"] });
          qc.invalidateQueries({ queryKey: ["destinations"] });
        }}
      />

      <ConfirmEarn46
        open={!!delTarget}
        title={`Delete "${delTarget?.name}"?`}
        description="This permanently removes the destination card. Enter Earn#46 to confirm."
        onCancel={() => setDelTarget(null)}
        onConfirm={async (secret) => {
          if (!delTarget) return;
          try {
            if (secret !== "Earn#46") {
              throw new Error("Secondary password required");
            }
            await deleteFirestoreDestination(delTarget.id);
            toast.success("Destination deleted");
            setDelTarget(null);
            qc.invalidateQueries({ queryKey: ["admin-destinations"] });
            qc.invalidateQueries({ queryKey: ["destinations"] });
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
    if (u.hostname && u.hostname.includes("firebasestorage.googleapis.com")) {
      const name = u.searchParams.get("name");
      if (name) return `/__admin/storage?name=${encodeURIComponent(name)}`;
      const m = u.pathname.match(/\/o\/(.+)$/);
      if (m && m[1]) {
        const decoded = decodeURIComponent(m[1]);
        return `/__admin/storage?name=${encodeURIComponent(decoded)}`;
      }
    }
  } catch {}
  return urlStr;
}

function DestinationDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial: FirestoreDestinationRow | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<FirestoreDestinationRow>>(
    () =>
      initial ?? {
        name: "",
        region: "",
        vibe: "",
        description: "",
        image_url: "",
        category: "Domestic",
        duration: "",
        best_season: "",
        package_count: 1,
        min_price: 0,
        highlights: [],
        featured: false,
      },
  );
  const [file, setFile] = useState<File | null>(null);
  const [highlightsText, setHighlightsText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      const next =
        initial ?? {
          name: "",
          region: "",
          vibe: "",
          description: "",
          image_url: "",
          category: "Domestic",
          duration: "",
          best_season: "",
          package_count: 1,
          min_price: 0,
          highlights: [],
          featured: false,
        };
      setForm(next);
      setFile(null);
      setHighlightsText((next.highlights ?? []).join("\n"));
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
        name: form.name!,
        region: form.region ?? "",
        vibe: form.vibe ?? "",
        description: form.description ?? "",
        image_url: image_url ?? "",
        category: (form.category ?? "Domestic") as FirestoreDestinationRow["category"],
        duration: form.duration ?? "",
        best_season: form.best_season ?? "",
        package_count: Number(form.package_count ?? 0),
        min_price: Number(form.min_price ?? 0),
        highlights: highlightsText
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        featured: !!form.featured,
      };

      if (initial) {
        await updateFirestoreDestination(initial.id, payload);
        toast.success("Destination updated");
      } else {
        await createFirestoreDestination(payload);
        toast.success("Destination created");
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
          <DialogTitle>{initial ? "Edit destination" : "New destination"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Name</Label>
              <Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Input
                value={form.region ?? ""}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="Indonesia, UAE, India"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vibe</Label>
              <Input
                value={form.vibe ?? ""}
                onChange={(e) => setForm({ ...form, vibe: e.target.value })}
                placeholder="Honeymoon favorite, Beach escape"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input value={form.duration ?? ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="5N / 6D" />
            </div>
            <div className="space-y-1.5">
              <Label>Best season</Label>
              <Input value={form.best_season ?? ""} onChange={(e) => setForm({ ...form, best_season: e.target.value })} placeholder="Apr - Oct" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category ?? "Domestic"}
                onValueChange={(v) => setForm({ ...form, category: v as FirestoreDestinationRow["category"] })}
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
            <div className="space-y-1.5">
              <Label>Package count</Label>
              <Input type="number" value={form.package_count ?? 0} onChange={(e) => setForm({ ...form, package_count: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Starting price (INR)</Label>
              <Input type="number" value={form.min_price ?? 0} onChange={(e) => setForm({ ...form, min_price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Highlights</Label>
              <Textarea
                rows={4}
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                placeholder={"Private villa\nBeach club access\nAirport transfer"}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Destination image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {form.image_url && !file && (
                <img src={form.image_url} alt="" className="h-20 rounded-lg object-cover mt-2" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="featured-destination"
              type="checkbox"
              checked={!!form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="featured-destination">Featured destination</Label>
          </div>
        </form>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={(e) => void submit(e as any)} disabled={busy} className="bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)]">
            {busy ? "Saving..." : initial ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
