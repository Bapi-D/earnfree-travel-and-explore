import { useMemo, useState, type ReactNode } from "react";
import { Loader2, LockKeyhole, LogOut, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type ResolveEmail = (identifier: string) => string;

type RoleAccessPageProps = {
  title: string;
  description: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  credentialHint: string;
  resolveEmail: ResolveEmail;
  allowRole: "admin" | "staff";
  children: ReactNode;
};

export function RoleAccessPage({
  title,
  description,
  credentialLabel,
  credentialPlaceholder,
  credentialHint,
  resolveEmail,
  allowRole,
  children,
}: RoleAccessPageProps) {
  const { loading, user, isAdmin, isStaff, signIn, signOut } = useAuth();
  const [authIdentifier, setAuthIdentifier] = useState<string>(allowRole);

  const [password, setPassword] = useState(allowRole === "admin" ? "admin@123" : "staff1@123");
  const [busy, setBusy] = useState(false);
  const allowed = useMemo(() => {
    return allowRole === "admin" ? isAdmin : isStaff;
  }, [allowRole, isAdmin, isStaff]);

  // credentialHint + input are used by both admin and staff role pages

  const showAccessWarning = user && !allowed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const email = resolveEmail(authIdentifier.trim());
    let res = await signIn(email, password);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Signed in successfully");
  };

  if (user && allowed) {
    return <>{children}</>;
  }

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-lg overflow-visible">
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/20 shadow-elegant">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gold/30 blur-3xl pointer-events-none" />

          <div className="relative p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center shadow-elegant">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-wide text-charcoal">
                EARNFREE
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold text-charcoal">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
              {loading && (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking your session...
                </div>
              )}
            </div>

            <div className="space-y-4">
              {showAccessWarning && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-muted-foreground space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive flex-none">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal">Access restricted</div>
                      <p>
                        You are signed in, but this page requires a different role. You can sign out
                        and enter the correct credentials below.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => signOut()}
                      className="flex-1 bg-charcoal text-white hover:bg-charcoal/90 rounded-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                      <a href="/">Go home</a>
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                {credentialHint}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${allowRole}-identifier`}>{credentialLabel}</Label>
                <Input
                  id={`${allowRole}-identifier`}
                  required
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  placeholder={credentialPlaceholder}
                  className="rounded-xl bg-white/70"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${allowRole}-password`}>Password</Label>
                <Input
                  id={`${allowRole}-password`}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="rounded-xl bg-white/70"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] hover:opacity-90 shadow-elegant h-11 text-base"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Enter ${title}`}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
