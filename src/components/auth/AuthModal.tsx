import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Plane } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signIn,
    signUp,
    signInWithGoogle,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = authModalMode === "login";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = isLogin
      ? await signIn(email, password)
      : await signUp(name, email, password, mobileNumber);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(isLogin ? "Welcome back!" : "Account created — you're in!");
    closeAuthModal();
    setEmail("");
    setMobileNumber("");
    setPassword("");
    setName("");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Welcome back!");
    closeAuthModal();
    setEmail("");
    setMobileNumber("");
    setPassword("");
    setName("");
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(o) => !o && closeAuthModal()}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md overflow-visible">
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/20 shadow-elegant">
          {/* Ambient glow */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gold/30 blur-3xl pointer-events-none" />

          <div className="relative p-8">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center shadow-elegant">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-wide text-charcoal">
                EARNFREE
              </span>
            </div>

            {/* Tab toggle */}
            <div className="relative grid grid-cols-2 mb-6 p-1 rounded-full bg-secondary/60 border border-border">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] shadow-elegant"
                style={{ left: isLogin ? "0.25rem" : "calc(50%)" }}
              />
              <button
                onClick={() => setAuthModalMode("login")}
                className={`relative z-10 py-2 text-sm font-semibold transition-colors ${isLogin ? "text-white" : "text-charcoal"}`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthModalMode("signup")}
                className={`relative z-10 py-2 text-sm font-semibold transition-colors ${!isLogin ? "text-white" : "text-charcoal"}`}
              >
                Sign up
              </button>
            </div>

            {/* Sliding form */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.form
                  key={authModalMode}
                  onSubmit={submit}
                  initial={{ x: isLogin ? -40 : 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isLogin ? 40 : -40, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="rounded-xl bg-white/70"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mobileNumber">Mobile number</Label>
                        <Input
                          id="mobileNumber"
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="rounded-xl bg-white/70"
                          inputMode="tel"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Gmail / Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className="rounded-xl bg-white/70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-xl bg-white/70"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.21_30)] hover:opacity-90 shadow-elegant h-11 text-base"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLogin ? (
                      "Login"
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <div className="relative flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogle}
                    disabled={busy}
                    className="w-full rounded-full h-11 bg-white/80 hover:bg-white border-border gap-2"
                  >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                  </Button>

                  <p className="text-center text-xs text-muted-foreground pt-1">
                    {isLogin ? "New here? " : "Already a member? "}
                    <button
                      type="button"
                      onClick={() => setAuthModalMode(isLogin ? "signup" : "login")}
                      className="text-primary font-semibold hover:underline"
                    >
                      {isLogin ? "Create an account" : "Login instead"}
                    </button>
                  </p>
                </motion.form>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
