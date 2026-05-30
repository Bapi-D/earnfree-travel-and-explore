import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  getFirestoreUserProfile,
  listFirestoreProfileFiles,
  listFirestoreProfiles,
  type FirestoreProfileFileRow,
  type FirestoreUserProfileRow,
  uploadFirestoreProfileAttachment,
} from "@/lib/firebase-data";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  Search,
  Upload,
  UserCircle2,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Earnfree" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, initials, fullName, isAdmin, openAuthModal, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentProfileQuery = useQuery({
    queryKey: ["profile", user?.uid],
    queryFn: () => getFirestoreUserProfile(user!.uid),
    enabled: !!user,
    retry: false,
  });

  const allProfilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: () => listFirestoreProfiles(),
    enabled: !!user && isAdmin,
    staleTime: 60_000,
    retry: false,
  });

  const activeProfileId = selectedProfileId ?? user?.uid ?? null;

  const profileFilesQuery = useQuery({
    queryKey: ["profile-files", activeProfileId],
    queryFn: () => listFirestoreProfileFiles(activeProfileId!),
    enabled: !!user && !!activeProfileId,
    retry: false,
  });

  const profile = currentProfileQuery.data as FirestoreUserProfileRow | null | undefined;
  const adminProfile = isAdmin && selectedProfileId
    ? (allProfilesQuery.data ?? []).find((entry) => entry.id === selectedProfileId)
    : null;

  const displayProfile = adminProfile ?? profile;

  const filteredProfiles = useMemo(() => {
    const profiles = allProfilesQuery.data ?? [];
    if (!search.trim()) return profiles;
    const term = search.trim().toLowerCase();
    return profiles.filter((entry) => {
      return (
        entry.full_name.toLowerCase().includes(term) ||
        entry.email.toLowerCase().includes(term) ||
        entry.id.toLowerCase().includes(term)
      );
    });
  }, [allProfilesQuery.data, search]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeProfileId || !uploadFile || !user) return;

    setUploading(true);
    try {
      await uploadFirestoreProfileAttachment(uploadFile, activeProfileId, user.uid, uploadTitle);
      toast.success("File uploaded");
      setUploadFile(null);
      setUploadTitle("");
      await queryClient.invalidateQueries({ queryKey: ["profile-files", activeProfileId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const selectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setUploadTitle("");
    setUploadFile(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(214,124,74,0.18),_transparent_36%),linear-gradient(180deg,_#fff8f2_0%,_#ffffff_48%,_#faf7f2_100%)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center justify-center">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-10">
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  Profile
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-charcoal sm:text-4xl">Sign in to view your profile</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Your profile, attachments, and saved details are shown after login. The page stays clean and focused on your account.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:min-w-[220px]">
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Secure access</div>
                  <div className="mt-1 text-sm font-semibold text-charcoal">Login or create an account</div>
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">What you get</div>
                  <div className="mt-1 text-sm font-semibold text-charcoal">Profile info, uploads, and status</div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => openAuthModal("login")}
                className="rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] shadow-elegant"
              >
                Login
              </Button>
              <Button variant="outline" onClick={() => openAuthModal("signup")} className="rounded-full">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attachments = profileFilesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(214,124,74,0.18),_transparent_36%),linear-gradient(180deg,_#fff8f2_0%,_#ffffff_48%,_#faf7f2_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="relative grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-8">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -right-16 top-6 h-72 w-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary to-gold text-2xl font-bold text-white shadow-elegant ring-8 ring-white/60">
                  {displayProfile?.avatar_url ? (
                    <img src={displayProfile.avatar_url} alt={displayProfile.full_name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Logged in profile
                  </div>
                  <h1 className="mt-3 text-3xl font-display font-bold text-charcoal sm:text-4xl">
                    {displayProfile?.full_name || fullName || "Traveler"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Account details, uploads, and access status are organized below for quick scanning.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary px-3 py-1 font-medium text-charcoal">{displayProfile?.email || user.email || "—"}</span>
                {isAdmin ? (
                  <span className="rounded-full bg-gold/15 px-3 py-1 font-medium text-charcoal">Admin access</span>
                ) : (
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">User profile</span>
                )}
                <span className="rounded-full bg-charcoal/5 px-3 py-1 font-medium text-charcoal">
                  {attachments.length} uploaded file{attachments.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <ProfileStat label="Name" value={displayProfile?.full_name || fullName || "—"} />
              <ProfileStat label="Email" value={displayProfile?.email || user.email || "—"} icon={<Mail className="h-4 w-4" />} />
              <ProfileStat label="Phone" value={displayProfile?.phone || "—"} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {isAdmin && (
              <aside className="space-y-4 rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-charcoal">All profiles</h2>
                  <p className="text-sm text-muted-foreground">Choose any user before uploading files.</p>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email"
                    className="rounded-2xl pl-9"
                  />
                </div>

                <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                  {allProfilesQuery.isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse rounded-2xl border border-border bg-secondary/30 p-4">
                          <div className="h-4 w-2/3 rounded bg-secondary" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-secondary/70" />
                        </div>
                      ))
                    : filteredProfiles.map((entry) => {
                        const active = entry.id === activeProfileId;
                        return (
                          <button
                            key={entry.id}
                            onClick={() => selectProfile(entry.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5 shadow-elegant" : "border-border bg-background hover:border-primary/30"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold font-semibold text-white">
                                {entry.full_name ? entry.full_name.slice(0, 2).toUpperCase() : "U"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-semibold text-charcoal">{entry.full_name || "Unnamed user"}</div>
                                <div className="truncate text-xs text-muted-foreground">{entry.email || entry.id}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}

                  {!allProfilesQuery.isLoading && filteredProfiles.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
                      No profiles found.
                    </div>
                  )}
                </div>
              </aside>
            )}

            <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
              <div className="border-b border-border/70 bg-gradient-to-r from-secondary/30 via-background to-background px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Profile overview</div>
                    <h2 className="mt-2 text-xl font-display font-bold text-charcoal">
                      {isAdmin && activeProfileId && activeProfileId !== user.uid ? "Selected profile" : "My profile"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isAdmin && activeProfileId && activeProfileId !== user.uid
                        ? "Admin-managed user profile and uploads."
                        : "This is the data saved when you sign in or sign up."}
                    </p>
                  </div>
                  <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-charcoal">
                    {isAdmin ? "Admin view" : "Private view"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                <DetailField label="Display name" value={displayProfile?.full_name || fullName || "—"} />
                <DetailField label="Email" value={displayProfile?.email || user.email || "—"} />
                <DetailField label="Phone" value={displayProfile?.phone || "—"} />
                <DetailField label="Avatar URL" value={displayProfile?.avatar_url || user.photoURL || "—"} />
                <DetailField label="Status" value={isAdmin ? "Admin visible" : "Private to you"} />
              </div>
            </section>

            {isAdmin && activeProfileId && (
              <section className="rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-display font-bold text-charcoal">Upload files to this profile</h2>
                    <p className="text-sm text-muted-foreground">Upload a ticket, photo, PDF, or any travel document.</p>
                  </div>
                </div>

                <form onSubmit={handleUpload} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="upload-title">Label</Label>
                    <Input
                      id="upload-title"
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      placeholder="Passport copy, ticket, receipt..."
                      className="rounded-2xl bg-white/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="upload-file">File</Label>
                    <Input
                      id="upload-file"
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setUploadFile(event.target.files?.[0] ?? null)}
                      className="rounded-2xl bg-white/80"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    className="rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] shadow-elegant"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading" : "Upload"}
                  </Button>
                </form>
              </section>
            )}
          </div>

          <aside className="space-y-4 rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-6 lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Library</div>
                <h2 className="mt-2 text-xl font-display font-bold text-charcoal">Uploaded files</h2>
                <p className="text-sm text-muted-foreground">Files attached to this profile appear here.</p>
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-charcoal">
                {attachments.length} file{attachments.length === 1 ? "" : "s"}
              </div>
            </div>

            {profileFilesQuery.isLoading ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-border bg-secondary/30 p-4">
                    <div className="h-28 rounded-xl bg-secondary" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-secondary" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-secondary/70" />
                  </div>
                ))}
              </div>
            ) : attachments.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                No files uploaded yet.
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {attachments.map((file) => (
                  <AttachmentCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-white to-secondary/20 px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-charcoal">{value || "—"}</div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-charcoal">{value || "—"}</div>
    </div>
  );
}

function AttachmentCard({ file }: { file: FirestoreProfileFileRow }) {
  const isImage = file.mime_type.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf" || file.original_name.toLowerCase().endsWith(".pdf");

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-background shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(0,0,0,0.08)]">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-secondary/50 via-background to-white p-4">
        {isImage ? (
          <img src={file.download_url} alt={file.title} className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
            {isPdf ? <FileText className="h-12 w-12 text-primary" /> : <ImageIcon className="h-12 w-12 text-primary" />}
            <span className="text-xs uppercase tracking-[0.24em]">{isPdf ? "PDF" : "File"}</span>
          </div>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <div className="line-clamp-1 font-semibold text-charcoal">{file.title}</div>
          <div className="line-clamp-1 text-xs text-muted-foreground">{file.original_name}</div>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-charcoal">{formatFileSize(file.file_size)}</span>
          <a
            href={file.download_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Download className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      </div>
    </article>
  );
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
