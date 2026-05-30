import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { firebaseAuth } from "@/integrations/firebase/client";
import {
  getFirestoreUserAccess,
  upsertFirestoreUserProfile,
  upsertFirestoreUserRole,
} from "@/lib/firebase-data";

export type AppRole = "admin" | "staff" | "user";
type DemoAuth = {
  email: string;
  role: Exclude<AppRole, "user">;
  fullName: string;
  staffNumber: number | null;
};

const DEMO_AUTH_STORAGE_KEY = "earnfree-demo-auth";
const DEMO_CREDENTIALS: Record<string, DemoAuth & { password: string }> = {
  admin: {
    email: "admin@earnfree.com",
    password: "admin@123",
    role: "admin",
    fullName: "Earnfree Admin",
    staffNumber: null,
  },
  staff1: {
    email: "staff1@earnfree.com",
    password: "staff1@123",
    role: "staff",
    fullName: "Staff 1",
    staffNumber: 1,
  },
};

interface AuthContextValue {
  session: null;
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean;
  staffNumber: number | null;
  initials: string;
  fullName: string;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (fullName: string, email: string, password: string, mobileNumber: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // Auth modal control
  authModalOpen: boolean;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "signup";
  setAuthModalMode: (m: "login" | "signup") => void;
  // Helper to gate actions
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function computeInitials(name: string, email?: string) {
  const source = (name || email || "").trim();
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function getStoredDemoAuth(): DemoAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DemoAuth>;
    if (!parsed.email || !parsed.role || !parsed.fullName) return null;
    return {
      email: parsed.email,
      role: parsed.role,
      fullName: parsed.fullName,
      staffNumber: parsed.staffNumber ?? null,
    };
  } catch {
    return null;
  }
}

function setStoredDemoAuth(auth: DemoAuth | null) {
  if (typeof window === "undefined") return;
  if (!auth) {
    window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function buildDemoUser(auth: DemoAuth): User {
  return {
    id: auth.email,
    app_metadata: {},
    user_metadata: { full_name: auth.fullName },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    confirmation_sent_at: null,
    confirmed_at: new Date().toISOString(),
    email: auth.email,
    email_confirmed_at: new Date().toISOString(),
    invited_at: null,
    last_sign_in_at: new Date().toISOString(),
    phone: "",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [fullName, setFullName] = useState("");
  const [staffNumber, setStaffNumber] = useState<number | null>(null);
  const [demoAuth, setDemoAuth] = useState<DemoAuth | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
      // Persistence is best-effort; auth still works without it.
    });

    const storedDemoAuth = getStoredDemoAuth();
    if (storedDemoAuth) {
      setDemoAuth(storedDemoAuth);
      setRoles([storedDemoAuth.role]);
      setFullName(storedDemoAuth.fullName);
      setStaffNumber(storedDemoAuth.staffNumber);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        getFirestoreUserAccess(nextUser.uid, nextUser.email ?? undefined)
          .then((access) => {
            setRoles(access.roles);
            setFullName(access.fullName || nextUser.displayName || nextUser.email || "");
            setStaffNumber(access.staffNumber);
          })
          .catch(() => {
            setRoles(["user"]);
            setFullName(nextUser.displayName ?? nextUser.email ?? "");
            setStaffNumber(null);
          });
      } else {
        setRoles([]);
        setFullName("");
        setStaffNumber(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const demo = Object.values(DEMO_CREDENTIALS).find(
      (entry) => entry.email === normalizedEmail && entry.password === password,
    );
    if (demo) {
      const demoSession = buildDemoUser(demo);
      const demoAuthState: DemoAuth = {
        email: demo.email,
        role: demo.role,
        fullName: demo.fullName,
        staffNumber: demo.staffNumber,
      };
      setStoredDemoAuth(demoAuthState);
      setDemoAuth(demoAuthState);
      setUser(demoSession);
      setRoles([demo.role]);
      setFullName(demo.fullName);
      setStaffNumber(demo.staffNumber);
      return {};
    }

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await upsertFirestoreUserProfile(credential.user.uid, {
        full_name: credential.user.displayName ?? credential.user.email ?? "",
        email: credential.user.email ?? "",
        phone: credential.user.phoneNumber ?? "",
        avatar_url: credential.user.photoURL ?? "",
      }).catch(() => {
        // If Firestore rules block this write, keep the auth session and avoid a false login error.
      });

      // Try to fetch access info from Firestore. If rules block access we should not
      // fail the sign-in flow — fall back to a basic "user" role so login succeeds.
      let access = { roles: ["user"] as AppRole[], fullName: credential.user.displayName ?? credential.user.email ?? "", staffNumber: null as number | null };
      try {
        const fetched = await getFirestoreUserAccess(credential.user.uid, credential.user.email ?? undefined);
        access = { roles: fetched.roles, fullName: fetched.fullName ?? access.fullName, staffNumber: fetched.staffNumber ?? null };
      } catch (e) {
        // Permissions prevented reading Firestore; proceed with default user role.
      }

      setUser(credential.user);
      setRoles(access.roles);
      setFullName(access.fullName || credential.user.displayName || credential.user.email || "");
      setStaffNumber(access.staffNumber);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Sign in failed" };
    }
  }, []);

  const signUp = useCallback(async (full_name: string, email: string, password: string, mobileNumber: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(credential.user, { displayName: full_name });
      await Promise.allSettled([
        upsertFirestoreUserProfile(credential.user.uid, {
          full_name,
          email,
          phone: mobileNumber,
          avatar_url: credential.user.photoURL ?? "",
        }),
        upsertFirestoreUserRole(credential.user.uid, { full_name, email, role: "user" }),
      ]);
      setUser(credential.user);
      setRoles(["user"]);
      setFullName(full_name);
      setStaffNumber(null);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Sign up failed" };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(firebaseAuth, provider);
      await Promise.allSettled([
        upsertFirestoreUserProfile(credential.user.uid, {
          full_name: credential.user.displayName ?? credential.user.email ?? "",
          email: credential.user.email ?? "",
          phone: credential.user.phoneNumber ?? "",
          avatar_url: credential.user.photoURL ?? "",
        }),
        upsertFirestoreUserRole(credential.user.uid, {
          full_name: credential.user.displayName ?? credential.user.email ?? "",
          email: credential.user.email ?? "",
          role: "user",
        }),
      ]);
      setUser(credential.user);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Google sign-in failed" };
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Password reset failed" };
    }
  }, []);

  const signOut = useCallback(async () => {
    setStoredDemoAuth(null);
    setDemoAuth(null);
    setUser(null);
    setRoles([]);
    setFullName("");
    setStaffNumber(null);
    await firebaseSignOut(firebaseAuth);
  }, []);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) action();
      else openAuthModal("login");
    },
    [user, openAuthModal],
  );

  const value: AuthContextValue = {
    session: null,
    user: user ?? (demoAuth ? buildDemoUser(demoAuth) : null),
    loading,
    roles,
    isAdmin: roles.includes("admin") || demoAuth?.role === "admin",
    isStaff: roles.includes("staff") || demoAuth?.role === "staff",
    staffNumber,
    initials: computeInitials(fullName || demoAuth?.fullName || "", user?.email ?? demoAuth?.email),
    fullName: fullName || demoAuth?.fullName || "",
    signIn,
    signUp,
    signInWithGoogle,
    // Keep the API flexible for the Firebase migration.
    signOut,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
