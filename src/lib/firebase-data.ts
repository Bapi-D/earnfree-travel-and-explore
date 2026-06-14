import { packages as samplePackages, type Package } from "@/data/packages";
import { PUBLIC_DESTINATIONS } from "@/data/destinations";

// NOTE:
// This file originally contained Firebase (Firestore/Storage) fallbacks for many admin flows.
// Per architecture, the package flow must be MongoDB + Multer/uploads only.
// Remaining non-package/admin-sync utilities are intentionally left untouched.


export type FirestoreEnquiryRow = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  destination: string;
  status: EnquiryStatus;
  assigned_staff_number: number;
  travelers: number | null;
  travel_date: string | null;
  message: string | null;
  created_at: string;
  updated_at?: string;
};

export type EnquiryStatus = "pending" | "solved" | "bypassed" | "admin_review";

export const ENQUIRY_STATUSES: Array<{ value: EnquiryStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "solved", label: "Solved" },
  { value: "admin_review", label: "Admin reviewed" },
  { value: "bypassed", label: "Bypass" },
];

export type FirestorePackageRow = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  location: string;
  duration: string;
  category: Package["category"];
  featured: boolean;
  rating: number;
  highlights?: string[];
  created_at?: string;
  updated_at?: string;
};

export type FirestoreDestinationRow = {
  id: string;
  name: string;
  region: string;
  vibe: string;
  description: string;
  image_url: string;
  category: Package["category"];
  duration: string;
  best_season: string;
  package_count: number;
  min_price: number;
  highlights?: string[];
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FirestoreUserRoleRow = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "user";
  created_at?: string;
};

export type FirestoreStaffProfileRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  staff_number: number;
  active: boolean;
  created_at?: string;
};

export type FirestoreUserProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type FirestoreProfileFileRow = {
  id: string;
  profile_id: string;
  uploader_id: string;
  title: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  download_url: string;
  created_at?: string;
};

const SEEDED_ACCOUNTS: Record<string, { role: FirestoreUserRoleRow["role"]; fullName: string; staffNumber: number | null }> = {
  "admin@earnfree.com": { role: "admin", fullName: "Earnfree Admin", staffNumber: null },
  "staff1@earnfree.com": { role: "staff", fullName: "Staff 1", staffNumber: 1 },
};

function toIsoString(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

function normalizeEnquiryStatus(value: unknown): EnquiryStatus {
  return value === "solved" || value === "bypassed" || value === "admin_review" ? value : "pending";
}

const PROFILE_MUTATION_EVENT = "earnfree-profile-changed";
const LOCAL_PROFILE_STORE_KEY = "earnfree-profile-store-v1";

function readBrowserProfileStore(): FirestoreUserProfileRow[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const profile = item as Partial<FirestoreUserProfileRow>;
      return {
        id: String(profile.id ?? ""),
        full_name: String(profile.full_name ?? ""),
        email: String(profile.email ?? ""),
        phone: String(profile.phone ?? ""),
        avatar_url: String(profile.avatar_url ?? ""),
        created_at: toIsoString(profile.created_at),
        updated_at: toIsoString(profile.updated_at),
      } satisfies FirestoreUserProfileRow;
    });
  } catch {
    return [];
  }
}

function writeBrowserProfileStore(rows: FirestoreUserProfileRow[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LOCAL_PROFILE_STORE_KEY, JSON.stringify(rows));
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
  broadcastProfileMutation();
}

function broadcastProfileMutation() {
  if (typeof window === "undefined") return;

  const stamp = String(Date.now());
  try {
    window.localStorage.setItem(PROFILE_MUTATION_EVENT, stamp);
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
  window.dispatchEvent(new Event(PROFILE_MUTATION_EVENT));
}

async function requestAdminEnquiries(endpoint: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) {
  const response = await fetch("/__admin/enquiries", {
    method: endpoint,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && payload !== null && "error" in payload
      ? String((payload as { error?: unknown }).error ?? "request_failed")
      : "request_failed";
    throw new Error(message);
  }

  return payload;
}

export async function getFirestoreDashboardStats() {
  const [enquiriesResult, packagesResult] = await Promise.allSettled([
    getFirestoreEnquiries(),
    getDocs(query(collection(firestore, "packages"), limit(100))),
  ]);

  const enquiries = enquiriesResult.status === "fulfilled" ? enquiriesResult.value : [];

  const packageCount = packagesResult.status === "fulfilled"
    ? packagesResult.value.docs.length
    : samplePackages.length;

  return {
    enquiries,
    packageCount,
  };
}

export async function getFirestoreEnquiries() {
  try {
    const payload = await requestAdminEnquiries("GET");
    if (!Array.isArray(payload)) {
      return [] as FirestoreEnquiryRow[];
    }

    return payload.map((item) => {
      const enquiry = item as Partial<FirestoreEnquiryRow>;
      const customerName = String(
        enquiry.customer_name
          ?? (item as { full_name?: unknown }).full_name
          ?? (item as { name?: unknown }).name
          ?? "",
      ).trim();
      const createdAt = toIsoString((item as { created_at?: unknown }).created_at) ?? new Date().toISOString();
      const updatedAt = toIsoString((item as { updated_at?: unknown }).updated_at);
      return {
        id: String(enquiry.id ?? ""),
        customer_name: customerName || "Unknown customer",
        email: String(enquiry.email ?? ""),
        phone: String(enquiry.phone ?? ""),
        destination: String(enquiry.destination ?? ""),
        status: normalizeEnquiryStatus(enquiry.status),
        assigned_staff_number: Number(enquiry.assigned_staff_number ?? (item as { assigned_staff_number?: unknown }).assigned_staff_number ?? 0),
        travelers: enquiry.travelers ?? null,
        travel_date: enquiry.travel_date ?? null,
        message: enquiry.message ?? null,
        created_at: createdAt,
        updated_at: updatedAt,
      } satisfies FirestoreEnquiryRow;
    });
  } catch {
    return [] as FirestoreEnquiryRow[];
  }
}

export async function createFirestoreEnquiry(
  data: Omit<FirestoreEnquiryRow, "id" | "created_at" | "status"> & { status?: EnquiryStatus },
) {
  const payload = await requestAdminEnquiries("POST", {
    ...data,
    status: data.status ?? "pending",
  });

  if (payload && typeof payload === "object" && payload !== null && "id" in payload) {
    return String((payload as { id?: unknown }).id ?? "");
  }

  throw new Error("request_failed");
}

export async function updateFirestoreEnquiryStatus(id: string, status: EnquiryStatus) {
  await requestAdminEnquiries("PATCH", { id, status });
}

export async function deleteFirestoreEnquiry(id: string) {
  await requestAdminEnquiries("DELETE", { id });
}

export type AnalyticsDailyPoint = {
  date: string; // YYYY-MM-DD
  visitors: number;
  enquiries: number;
};

export type AnalyticsPayload = {
  totalVisitors: number;
  totalEnquiries: number;
  daily: AnalyticsDailyPoint[];
  deviceCounts?: Record<string, number>;
  returningCount?: number;
  newCount?: number;
  conversionRate?: number; // percent
};

export async function getAnalyticsData(): Promise<AnalyticsPayload | null> {
  try {
    const res = await fetch('/__admin/analytics');
    if (!res.ok) return null;
    const payload = await res.json();
    return payload as AnalyticsPayload;
  } catch (err) {
    return null;
  }
}

export async function recordVisit(data: { path?: string; userAgent?: string; device?: string; returning?: boolean }) {
  try {
    await fetch('/__admin/analytics/visit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    // ignore
  }
}

export async function getFirestorePackages() {
  try {
    // Try API first
    const response = await fetch('/api/packages?limit=100', {
      method: 'GET',
    });

    if (response.ok) {
      const apiPackages = await response.json();
      if (Array.isArray(apiPackages) && apiPackages.length > 0) {
        // Transform API response to match Package type
        return apiPackages.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.title || "Untitled package",
          destination: pkg.location || pkg.destination || "",
          category: (pkg.category as Package["category"]) || "Domestic",
          duration: pkg.duration || "",
          price: Number(pkg.price || 0),
          rating: Number(pkg.rating || 4.7),
          image: pkg.image_url || "",
          highlights: pkg.highlights || [],
        }));
      }
    }
  } catch (apiError) {
    console.debug('API fetch failed, trying Firebase:', apiError);
  }

  // Fallback to Firebase
  try {
    const snapshot = await getDocs(query(collection(firestore, "packages"), orderBy("created_at", "desc")));

    const packages = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        name: String(data.title ?? data.name ?? "Untitled package"),
        destination: String(data.location ?? data.destination ?? ""),
        category: (data.category as Package["category"]) ?? "Domestic",
        duration: String(data.duration ?? ""),
        price: Number(data.price ?? 0),
        rating: Number(data.rating ?? 4.7),
        image: String(data.image_url ?? data.image ?? ""),
        highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
      } satisfies Package;
    });

    return packages.length > 0 ? packages : samplePackages;
  } catch {
    return samplePackages;
  }
}

export async function getFirestoreAdminPackages() {
  try {
    // Try API first
    const response = await fetch('/api/packages?admin=true&limit=100', {
      method: 'GET',
    });

    if (response.ok) {
      const apiPackages = await response.json();
      if (Array.isArray(apiPackages)) {
        return apiPackages.map((pkg: any) => ({
          id: pkg.id,
          title: pkg.title || "Untitled package",
          description: pkg.description || "",
          image_url: pkg.image_url || "",
          price: Number(pkg.price || 0),
          location: pkg.location || "",
          duration: pkg.duration || "",
          category: (pkg.category || "Domestic") as FirestorePackageRow["category"],
          featured: Boolean(pkg.featured),
          rating: Number(pkg.rating || 4.7),
          highlights: pkg.highlights || [],
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
        }));
      }
    }
  } catch (apiError) {
    console.debug('API fetch failed, trying Firebase:', apiError);
  }

  // Fallback to Firebase
  try {
    const snapshot = await getDocs(query(collection(firestore, "packages"), orderBy("created_at", "desc"), limit(100)));

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Partial<FirestorePackageRow>;
      return {
        id: docSnap.id,
        title: data.title ?? "Untitled package",
        description: data.description ?? "",
        image_url: data.image_url ?? "",
        price: Number(data.price ?? 0),
        location: data.location ?? "",
        duration: data.duration ?? "",
        category: (data.category ?? "Domestic") as FirestorePackageRow["category"],
        featured: Boolean(data.featured),
        rating: Number(data.rating ?? 4.7),
        highlights: data.highlights ?? [],
        created_at: toIsoString(data.created_at),
        updated_at: toIsoString(data.updated_at),
      } satisfies FirestorePackageRow;
    });
  } catch {
    return [] as FirestorePackageRow[];
  }
}

export async function uploadFirestorePackageImage(file: File) {
  // Get Firebase token for authentication
  let token: string | null = null;
  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      token = await user.getIdToken();
    }
  } catch (error) {
    console.debug('Could not get Firebase token:', error);
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (file) {
    console.debug('[upload] selected file', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[upload] failed response', {
      status: response.status,
      statusText: response.statusText,
      body: error,
    });
    if (response.status === 401) {
      throw new Error('Admin authentication required. Please log in again.');
    }
    throw new Error(error.statusMessage || `Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.debug('[upload] success response', data);
  if (!data.imageUrl) {
    throw new Error('No image URL returned from upload');
  }

  return data.imageUrl;
}

export async function createFirestorePackage(data: Omit<FirestorePackageRow, "id" | "created_at" | "updated_at">) {
  try {
    // Get Firebase token for authentication
    let token: string | null = null;
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        token = await user.getIdToken();
      }
    } catch (error) {
      console.debug('Could not get Firebase token:', error);
    }

    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try API first
    const response = await fetch('/api/packages', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result.id;
    } else if (response.status === 401) {
      throw new Error('Admin authentication required. Please log in again.');
    }
  } catch (apiError) {
    console.debug('API create failed, trying Firebase:', apiError);
  }

  // Fallback to Firebase
  try {
    const docRef = await addDoc(collection(firestore, "packages"), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Both create methods failed:', error);
    throw error;
  }
}

export async function updateFirestorePackage(id: string, data: Omit<FirestorePackageRow, "id" | "created_at" | "updated_at">) {
  try {
    // Get Firebase token for authentication
    let token: string | null = null;
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        token = await user.getIdToken();
      }
    } catch (error) {
      console.debug('Could not get Firebase token:', error);
    }

    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try API first
    const response = await fetch(`/api/packages/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return;
    } else if (response.status === 401) {
      throw new Error('Admin authentication required. Please log in again.');
    }
  } catch (apiError) {
    console.debug('API update failed, trying Firebase:', apiError);
  }

  // Fallback to Firebase
  try {
    await updateDoc(doc(firestore, "packages", id), {
      ...data,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Both update methods failed:', error);
    throw error;
  }
}

export async function deleteFirestorePackage(id: string) {
  try {
    // Try API first
    const response = await fetch(`/api/packages/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      return;
    }
  } catch (apiError) {
    console.debug('API delete failed, trying Firebase:', apiError);
  }

  // Fallback to Firebase
  try {
    await deleteDoc(doc(firestore, "packages", id));
  } catch (error) {
    console.error('Both delete methods failed:', error);
    throw error;
  }
}

export async function getFirestoreDestinations() {
  try {
    const snapshot = await getDocs(query(collection(firestore, "destinations"), orderBy("created_at", "desc"), limit(200)));

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Partial<FirestoreDestinationRow>;
      return {
        id: docSnap.id,
        name: data.name ?? "Untitled destination",
        region: data.region ?? "",
        vibe: data.vibe ?? "Featured destination",
        description: data.description ?? "",
        image_url: data.image_url ?? "",
        category: (data.category ?? "Domestic") as FirestoreDestinationRow["category"],
        duration: data.duration ?? "",
        best_season: data.best_season ?? "",
        package_count: Number(data.package_count ?? 0),
        min_price: Number(data.min_price ?? 0),
        highlights: data.highlights ?? [],
        featured: Boolean(data.featured),
        created_at: toIsoString(data.created_at),
        updated_at: toIsoString(data.updated_at),
      } satisfies FirestoreDestinationRow;
    });
  } catch {
    return [] as FirestoreDestinationRow[];
  }
}

export async function getFirestoreAdminDestinations() {
  try {
    const snapshot = await getDocs(query(collection(firestore, "destinations"), limit(1)));
    if (snapshot.size === 0) {
      try {
        await Promise.all(
          PUBLIC_DESTINATIONS.map((destination) =>
            createFirestoreDestination({
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
            }),
        ),
        );
      } catch {
        // ignore seeding failures and fall through to returning PUBLIC_DESTINATIONS
      }
    }

    return getFirestoreDestinations();
  } catch (firestoreErr) {
    // If Firestore access fails (security rules / network), try the admin proxy endpoint
    try {
      const adminDestUrl = import.meta.env.DEV
        ? (import.meta.env.VITE_DEV_ADMIN_URL || "http://localhost:8788") + "/__admin/destinations"
        : "/__admin/destinations";

      let resp = null as Response | null;
      try {
        resp = await fetch(adminDestUrl, { method: "GET", credentials: "include" });
      } catch (e) {
        try {
          resp = await fetch("/__admin/destinations", { method: "GET" });
        } catch (e2) {
          resp = null;
        }
      }

      if (resp && resp.ok) {
        const payload = await resp.json().catch(() => null);
        if (Array.isArray(payload)) {
          return payload.map((item) => {
            const d = item as Partial<FirestoreDestinationRow & { id?: string; name?: string }>;
            return {
              id: String(d.id ?? d.name ?? ""),
              name: d.name ?? d.title ?? "Untitled destination",
              region: d.region ?? d.location ?? "",
              vibe: d.vibe ?? d.vibe ?? "",
              description: d.description ?? d.description ?? "",
              image_url: d.image_url ?? d.image ?? "",
              category: (d.category ?? "Domestic") as FirestoreDestinationRow["category"],
              duration: d.duration ?? d.duration ?? "",
              best_season: d.best_season ?? d.best_season ?? "",
              package_count: Number(d.package_count ?? d.package_count ?? 0),
              min_price: Number(d.min_price ?? d.price ?? 0),
              highlights: d.highlights ?? [],
              featured: Boolean(d.featured),
              created_at: toIsoString(d.created_at),
              updated_at: toIsoString(d.updated_at),
            } as FirestoreDestinationRow;
          });
        }
      }
    } catch (err) {
      // ignore admin proxy failures
    }

    // As a last resort, return the public hardcoded destinations so admin UI remains usable.
    return PUBLIC_DESTINATIONS.map((destination) => ({
      id: destination.name.toLowerCase(),
      name: destination.name,
      region: destination.region,
      vibe: destination.vibe ?? "",
      description: destination.description,
      image_url: destination.image,
      category: destination.category,
      duration: destination.duration,
      best_season: "",
      package_count: destination.package_count ?? 1,
      min_price: destination.minPrice,
      highlights: destination.highlights,
      featured: destination.name === "Bali",
    } as FirestoreDestinationRow));
  }
}

export async function createFirestoreDestination(data: Omit<FirestoreDestinationRow, "id" | "created_at" | "updated_at">) {
  try {
    const docRef = await addDoc(collection(firestore, "destinations"), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (firestoreErr) {
    // If Firestore write fails (rules / network), try the admin proxy endpoint so the admin UI can still create destinations.
    try {
      const adminCreateUrl = import.meta.env.DEV
        ? (import.meta.env.VITE_DEV_ADMIN_URL || "http://localhost:8788") + "/__admin/destinations"
        : "/__admin/destinations";

      let resp = null as Response | null;
      try {
        resp = await fetch(adminCreateUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });
      } catch {
        try {
          resp = await fetch("/__admin/destinations", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch (e) {
          resp = null;
        }
      }

      if (resp && resp.ok) {
        const payload = await resp.json().catch(() => null);
        if (payload && typeof payload === "object" && "id" in payload) {
          return String((payload as { id?: unknown }).id ?? "");
        }
        // If proxy returns whole object, try to get id or name
        if (payload && typeof payload === "object") {
          return String((payload as any).id ?? (payload as any).name ?? "");
        }
      }
    } catch (err) {
      // ignore
    }

    throw firestoreErr instanceof Error ? firestoreErr : new Error(String(firestoreErr));
  }
}

export async function updateFirestoreDestination(id: string, data: Omit<FirestoreDestinationRow, "id" | "created_at" | "updated_at">) {
  await updateDoc(doc(firestore, "destinations", id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteFirestoreDestination(id: string) {
  await deleteDoc(doc(firestore, "destinations", id));
}

export async function getFirestoreUserAccess(userId: string, email?: string) {
  const [roleSnap, profileSnap, staffSnap] = await Promise.all([
    getDoc(doc(firestore, "user_roles", userId)),
    getDoc(doc(firestore, "profiles", userId)),
    getDoc(doc(firestore, "staff_profiles", userId)),
  ]);

  const roleData = roleSnap.exists() ? (roleSnap.data() as Partial<FirestoreUserRoleRow>) : null;
  const profileData = profileSnap.exists()
    ? (profileSnap.data() as { full_name?: string; email?: string; phone?: string; avatar_url?: string })
    : null;
  const staffData = staffSnap.exists()
    ? (staffSnap.data() as Partial<FirestoreStaffProfileRow>)
    : null;

  const seed = email ? SEEDED_ACCOUNTS[email.toLowerCase()] : undefined;

  return {
    roles: roleData?.role ? [roleData.role] : seed ? [seed.role] : ["user"],
    fullName: profileData?.full_name ?? roleData?.full_name ?? staffData?.full_name ?? seed?.fullName ?? "",
    staffNumber:
      staffData?.active && typeof staffData.staff_number === "number"
        ? staffData.staff_number
        : seed?.staffNumber ?? null,
    email: profileData?.email ?? roleData?.email ?? staffData?.email ?? email ?? "",
  };
}

export async function getFirestoreUserProfile(userId: string) {
  try {
    const snapshot = await getDoc(doc(firestore, "profiles", userId));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as Partial<FirestoreUserProfileRow>;
    return {
      id: snapshot.id,
      full_name: data.full_name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      avatar_url: data.avatar_url ?? "",
      created_at: toIsoString(data.created_at),
      updated_at: toIsoString(data.updated_at),
    } satisfies FirestoreUserProfileRow;
  } catch {
    return null;
  }
}

export async function listFirestoreProfiles() {
  try {
    const snapshot = await getDocs(query(collection(firestore, "profiles"), limit(200)));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Partial<FirestoreUserProfileRow>;
      return {
        id: docSnap.id,
        full_name: data.full_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        avatar_url: data.avatar_url ?? "",
        created_at: toIsoString(data.created_at),
        updated_at: toIsoString(data.updated_at),
      } satisfies FirestoreUserProfileRow;
    }).sort((left, right) => (right.created_at ?? "").localeCompare(left.created_at ?? ""));
  } catch {
    return [] as FirestoreUserProfileRow[];
  }
}

async function requestAdminProfiles(endpoint: "GET" | "POST" | "DELETE", body?: unknown) {
  const adminProfilesUrl = import.meta.env.DEV
    ? (import.meta.env.VITE_DEV_ADMIN_URL || "http://localhost:8788") + "/__admin/profiles"
    : "/__admin/profiles";

  // Try direct dev admin URL first (useful when running the local admin server).
  // If that fails (proxying or network), fall back to the relative `/__admin/profiles`
  // route so the app server can proxy or use its embedded store.
  let response: Response | null = null;
  const payloadBody = body ? JSON.stringify(body) : undefined;

  try {
    console.debug('[admin-sync] attempting', adminProfilesUrl, { method: endpoint, body });
    response = await fetch(adminProfilesUrl, {
      method: endpoint,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: payloadBody,
      credentials: 'include',
    });

    if (response && !response.ok) {
      console.warn('[admin-sync] primary admin URL returned', response.status, 'falling back to relative path');
      try {
        response = await fetch('/__admin/profiles', {
          method: endpoint,
          headers: body ? { "content-type": "application/json" } : undefined,
          body: payloadBody,
        });
      } catch (innerErr) {
        // will be handled below
      }
    }
  } catch (err) {
    // network error to dev admin host — try relative path via app server
    try {
      response = await fetch('/__admin/profiles', {
        method: endpoint,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: payloadBody,
      });
    } catch (err2) {
      // both attempts failed — rethrow the original error for upstream handling
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
  if (!response) throw new Error('No response from admin sync');

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && payload !== null && "error" in payload
      ? String((payload as { error?: unknown }).error ?? "request_failed")
      : "request_failed";
    throw new Error(message);
  }

  return payload;
}

export async function listAdminProfiles() {
  const firestoreProfiles = await listFirestoreProfiles();
  if (firestoreProfiles.length > 0) {
    return firestoreProfiles;
  }

  try {
    const payload = await requestAdminProfiles("GET");
    return Array.isArray(payload)
      ? payload.map((item) => {
          const profile = item as Partial<FirestoreUserProfileRow>;
          return {
            id: String(profile.id ?? ""),
            full_name: String(profile.full_name ?? ""),
            email: String(profile.email ?? ""),
            phone: String(profile.phone ?? ""),
            avatar_url: String(profile.avatar_url ?? ""),
            created_at: toIsoString(profile.created_at),
            updated_at: toIsoString(profile.updated_at),
          } satisfies FirestoreUserProfileRow;
        })
      : [] as FirestoreUserProfileRow[];
  } catch {
    return [] as FirestoreUserProfileRow[];
  }
}

export async function deleteAdminProfile(profileId: string) {
  await deleteFirestoreProfile(profileId);
}

export function subscribeFirestoreProfiles(
  onNext: (profiles: FirestoreUserProfileRow[]) => void,
  onError?: (error: Error) => void,
) {
  const profileQuery = query(collection(firestore, "profiles"), limit(200));

  return onSnapshot(
    profileQuery,
    (snapshot) => {
      onNext(snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Partial<FirestoreUserProfileRow>;
        return {
          id: docSnap.id,
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          avatar_url: data.avatar_url ?? "",
          created_at: toIsoString(data.created_at),
          updated_at: toIsoString(data.updated_at),
        } satisfies FirestoreUserProfileRow;
      }).sort((left, right) => (right.created_at ?? "").localeCompare(left.created_at ?? "")));
    },
    (error) => {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  );
}

export async function deleteFirestoreProfile(profileId: string) {
  try {
    const filesSnapshot = await getDocs(query(collection(firestore, "profile_files"), where("profile_id", "==", profileId), limit(500)));
    await Promise.all(filesSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  } catch {
    // Ignore attachment cleanup failures so the profile record can still be removed.
  }

  await Promise.allSettled([
    deleteDoc(doc(firestore, "profiles", profileId)),
    deleteDoc(doc(firestore, "user_roles", profileId)),
    deleteDoc(doc(firestore, "staff_profiles", profileId)),
  ]);
  await requestAdminProfiles("DELETE", { id: profileId }).catch(() => undefined);
  broadcastProfileMutation();
}

export async function listFirestoreProfileFiles(profileId: string) {
  try {
    const snapshot = await getDocs(query(collection(firestore, "profile_files"), where("profile_id", "==", profileId), limit(100)));

    return snapshot.docs
      .map((docSnap) => {
      const data = docSnap.data() as Partial<FirestoreProfileFileRow>;
      return {
        id: docSnap.id,
        profile_id: data.profile_id ?? profileId,
        uploader_id: data.uploader_id ?? "",
        title: data.title ?? data.original_name ?? "Untitled file",
        original_name: data.original_name ?? "",
        mime_type: data.mime_type ?? "application/octet-stream",
        file_size: Number(data.file_size ?? 0),
        storage_path: data.storage_path ?? "",
        download_url: data.download_url ?? "",
        created_at: toIsoString(data.created_at),
      } satisfies FirestoreProfileFileRow;
      })
      .sort((left, right) => (right.created_at ?? "").localeCompare(left.created_at ?? ""));
  } catch {
    return [] as FirestoreProfileFileRow[];
  }
}

export async function upsertFirestoreUserProfile(
  userId: string,
  data: { full_name: string; email: string; phone?: string; avatar_url?: string },
) {
  const profileRef = doc(firestore, "profiles", userId);
  let createdAt: string | undefined;
  let firestoreError: unknown = null;
  let adminSyncError: unknown = null;

  try {
    const existing = await getDoc(profileRef);
    createdAt = existing.exists() ? toIsoString((existing.data() as { created_at?: unknown }).created_at) : undefined;
  } catch (error) {
    firestoreError = error;
  }

  try {
    await setDoc(
      profileRef,
      {
        id: userId,
        ...data,
        created_at: createdAt,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    firestoreError = firestoreError ?? error;
  }

  try {
    await requestAdminProfiles("POST", {
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? "",
      avatar_url: data.avatar_url ?? "",
      created_at: createdAt,
    });
  } catch (error) {
    adminSyncError = error;
  }

  broadcastProfileMutation();

  if (firestoreError && adminSyncError) {
    throw firestoreError instanceof Error ? firestoreError : new Error(String(firestoreError));
  }
}

export async function upsertFirestoreUserRole(userId: string, data: { email: string; full_name: string; role: "admin" | "staff" | "user" }) {
  const roleRef = doc(firestore, "user_roles", userId);
  const existing = await getDoc(roleRef);
  const createdAt = existing.exists() ? (existing.data() as { created_at?: unknown }).created_at ?? serverTimestamp() : serverTimestamp();

  await setDoc(
    roleRef,
    {
      ...data,
      created_at: createdAt,
    },
    { merge: true },
  );
}

export async function upsertFirestoreStaffProfile(data: FirestoreStaffProfileRow) {
  const staffRef = doc(firestore, "staff_profiles", data.id);
  const existing = await getDoc(staffRef);
  const createdAt = existing.exists() ? (existing.data() as { created_at?: unknown }).created_at ?? serverTimestamp() : serverTimestamp();

  await setDoc(
    staffRef,
    {
      ...data,
      created_at: createdAt,
    },
    { merge: true },
  );
}

export async function listFirestoreStaffProfiles() {
  try {
    const snapshot = await getDocs(query(collection(firestore, "staff_profiles"), orderBy("staff_number"), limit(100)));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirestoreStaffProfileRow, "id">),
      created_at: toIsoString((docSnap.data() as Record<string, unknown>).created_at),
    })) as FirestoreStaffProfileRow[];
  } catch {
    return [] as FirestoreStaffProfileRow[];
  }
}

export async function listFirestoreProfilesByIds(ids: string[]) {
  if (ids.length === 0) return [] as Array<{ id: string; full_name: string; email: string; phone?: string }>;
  try {
    const snapshot = await getDocs(query(collection(firestore, "profiles"), where("id", "in", ids.slice(0, 10))));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as { full_name: string; email: string; phone?: string }),
    }));
  } catch {
    return [] as Array<{ id: string; full_name: string; email: string; phone?: string }>;
  }
}

export async function setFirestoreStaffActive(id: string, active: boolean) {
  await updateDoc(doc(firestore, "staff_profiles", id), { active });
}

export async function uploadFirestoreProfileAttachment(
  file: File,
  profileId: string,
  uploaderId: string,
  title?: string,
) {
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `profile-files/${profileId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storageRef = ref(firebaseStorage, storagePath);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  const docRef = await addDoc(collection(firestore, "profile_files"), {
    profile_id: profileId,
    uploader_id: uploaderId,
    title: title?.trim() || file.name,
    original_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    storage_path: storagePath,
    download_url: downloadUrl,
    created_at: serverTimestamp(),
  });

  return {
    id: docRef.id,
    profile_id: profileId,
    uploader_id: uploaderId,
    title: title?.trim() || file.name,
    original_name: file.name,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    storage_path: storagePath,
    download_url: downloadUrl,
  } satisfies FirestoreProfileFileRow;
}