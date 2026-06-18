import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type FirebaseAdminModule = typeof import("firebase-admin");
type FsModule = typeof import("node:fs");
type PathModule = typeof import("node:path");

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let firebaseAdminPromise: Promise<FirebaseAdminModule | null> | undefined;
let fsPromise: Promise<FsModule> | undefined;
let pathPromise: Promise<PathModule> | undefined;
type LocalEnquiryRow = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  destination: string;
  status: string;
  assigned_staff_number: number;
  travelers: number | null;
  travel_date: string | null;
  message: string | null;
  created_at: string;
  updated_at?: string;
};

const globalForLocalData = globalThis as typeof globalThis & {
  __localEnquiries?: LocalEnquiryRow[];
};
type LocalProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  created_at: string;
  updated_at?: string;
};

const globalForProfileData = globalThis as typeof globalThis & {
  __localProfiles?: LocalProfileRow[];
};

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

async function getFirebaseAdmin(): Promise<FirebaseAdminModule | null> {
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }

  if (!firebaseAdminPromise) {
    firebaseAdminPromise = import("node:module").then(({ createRequire }) => {
      const require = createRequire(import.meta.url);
      return require("firebase-admin") as FirebaseAdminModule;
    });
  }

  return firebaseAdminPromise;
}

async function getFs(): Promise<FsModule | null> {
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }

  if (!fsPromise) {
    fsPromise = import("node:fs");
  }

  return fsPromise;
}

async function getPath(): Promise<PathModule | null> {
  if (typeof process === "undefined" || !process.versions?.node) {
    return null;
  }

  if (!pathPromise) {
    pathPromise = import("node:path");
  }

  return pathPromise;
}

async function initFirebaseAdmin() {
  const admin = await getFirebaseAdmin();
  const fs = await getFs();

  if (!admin || !fs) return null;

  const getApps = (admin as unknown as { getApps?: () => unknown[]; apps?: unknown[] }).getApps;
  const existingApps =
    typeof getApps === "function"
      ? getApps()
      : ((admin as unknown as { apps?: unknown[] }).apps ?? []);

  if (existingApps.length > 0) return admin;

  let serviceAccount: any = undefined;
  if (process.env.SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error("Failed to parse SERVICE_ACCOUNT_JSON", err);
    }
  }

  if (!serviceAccount) {
    const p = process.env.SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";
    try {
      const raw = fs.readFileSync(p, "utf8");
      serviceAccount = JSON.parse(raw);
    } catch (err) {
      // If missing, we'll allow admin to remain uninitialized and surface errors when used.
      console.warn(
        `Service account not found at ${p}; admin SDK will not be initialized until provided.`,
      );
    }
  }

  if (serviceAccount) {
    // Some env providers or .env files store the private_key with escaped newlines ("\\n").
    // Normalize so the Admin SDK receives a proper PEM with real newlines.
    try {
      if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n").trim();
      }
    } catch (e) {
      // ignore normalization errors and continue to let initializeApp surface any problems
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
      console.log("Firebase Admin initialized");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin:", err);
    }
  }

  return admin;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

function serializeEnquiryDoc(id: string, data: Record<string, unknown>) {
  const createdAt = data.created_at;
  const updatedAt = data.updated_at;

  const toIso = (value: unknown) => {
    if (!value) return new Date().toISOString();
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (value as { toDate?: () => Date }).toDate === "function"
    ) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date().toISOString();
  };

  return {
    id,
    customer_name: String(data.customer_name ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    destination: String(data.destination ?? ""),
    status: String(data.status ?? "pending"),
    assigned_staff_number: Number(data.assigned_staff_number ?? 0),
    travelers: data.travelers == null ? null : Number(data.travelers),
    travel_date: data.travel_date == null ? null : String(data.travel_date),
    message: data.message == null ? null : String(data.message),
    created_at: toIso(createdAt),
    updated_at: updatedAt ? toIso(updatedAt) : undefined,
  };
}

function serializeProfileDoc(id: string, data: Record<string, unknown>) {
  const toIso = (value: unknown) => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (value as { toDate?: () => Date }).toDate === "function"
    ) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    return undefined;
  };

  return {
    id,
    full_name: String(data.full_name ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    avatar_url: String(data.avatar_url ?? ""),
    created_at: toIso(data.created_at),
    updated_at: toIso(data.updated_at),
  };
}

function getLocalProfiles() {
  if (!globalForProfileData.__localProfiles) {
    globalForProfileData.__localProfiles = [];
  }

  return globalForProfileData.__localProfiles;
}

function normalizeLocalProfile(input: Partial<LocalProfileRow> & { id: string }) {
  const now = new Date().toISOString();
  return {
    id: input.id,
    full_name: String(input.full_name ?? ""),
    email: String(input.email ?? ""),
    phone: String(input.phone ?? ""),
    avatar_url: String(input.avatar_url ?? ""),
    created_at: String(input.created_at ?? now),
    updated_at: String(input.updated_at ?? now),
  } satisfies LocalProfileRow;
}

async function readProfileStore(): Promise<LocalProfileRow[]> {
  return getLocalProfiles();
}

async function writeProfileStore(rows: LocalProfileRow[]) {
  globalForProfileData.__localProfiles = rows;
}

function getLocalEnquiries() {
  if (!globalForLocalData.__localEnquiries) {
    globalForLocalData.__localEnquiries = [];
  }

  return globalForLocalData.__localEnquiries;
}

function toLocalEnquiryRow(input: {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  destination: string;
  status?: string;
  assigned_staff_number?: number;
  travelers?: number | null;
  travel_date?: string | null;
  message?: string | null;
}): LocalEnquiryRow {
  const now = new Date().toISOString();

  return {
    id: input.id,
    customer_name: input.customer_name,
    email: input.email,
    phone: input.phone,
    destination: input.destination,
    status: input.status ?? "pending",
    assigned_staff_number: input.assigned_staff_number ?? 0,
    travelers: input.travelers ?? null,
    travel_date: input.travel_date ?? null,
    message: input.message ?? null,
    created_at: now,
    updated_at: now,
  };
}

function parseLocalEnquiryBody(bodyText: string | undefined) {
  if (!bodyText) return null;

  try {
    return JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

async function requireAdmin(request: Request): Promise<boolean> {
  const adminKey = process.env.ADMIN_API_KEY || "";
  const provided = request.headers.get("x-admin-key") || "";

  if (adminKey && provided === adminKey) return true;

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  if (!token) return false;

  const admin = await initFirebaseAdmin();
  if (!admin) return false;

  const decoded = await admin.auth().verifyIdToken(token);
  if ((decoded as any).role === "admin") return true;

  if (decoded.uid) {
    const roleDoc = await admin.firestore().collection("user_roles").doc(decoded.uid).get();
    return roleDoc.exists && roleDoc.data()?.role === "admin";
  }

  return false;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/__admin/profiles") {
        let authorized = false;
        try {
          authorized = await requireAdmin(request);
        } catch {
          authorized = false;
        }
        if (!authorized) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }
        const devAdminUrl = process.env.DEV_ADMIN_URL || "";
        let bodyText: string | undefined = undefined;
        try {
          bodyText = await request.text();
        } catch {
          bodyText = undefined;
        }

        if (devAdminUrl && process.env.NODE_ENV !== "production") {
          try {
            const proxiedUrl = new URL("/__admin/profiles", devAdminUrl);
            proxiedUrl.search = url.search;
            const proxiedWithPath = await fetch(proxiedUrl, {
              method: request.method,
              headers: request.headers as HeadersInit,
              body: bodyText && bodyText.length > 0 ? bodyText : undefined,
            });
            const proxiedBody = await proxiedWithPath.arrayBuffer();
            const headers: Record<string, string> = {};
            proxiedWithPath.headers.forEach((value, key) => {
              headers[key] = value;
            });
            return new Response(proxiedBody, { status: proxiedWithPath.status, headers });
          } catch (err) {
            console.warn(
              "Failed to proxy /__admin/profiles to DEV_ADMIN_URL, falling back to embedded admin:",
              err,
            );
          }
        }

        if (request.method === "GET") {
          try {
            const profiles = (await readProfileStore()).sort((left, right) =>
              (right.created_at ?? "").localeCompare(left.created_at ?? ""),
            );
            return new Response(JSON.stringify(profiles), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          } catch (err) {
            console.warn("Failed to list profiles:", err);
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }
        }

        if (request.method === "DELETE") {
          let body: any = null;
          try {
            body = bodyText ? JSON.parse(bodyText) : null;
          } catch {
            body = null;
          }

          if (!body || !body.id) {
            return new Response(JSON.stringify({ error: "invalid_payload" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const profileId = String(body.id);
          try {
            const rows = await readProfileStore();
            const nextRows = rows.filter((profile) => profile.id !== profileId);
            await writeProfileStore(nextRows);
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          } catch (err) {
            console.error("Failed to delete profile:", err);
            return new Response(JSON.stringify({ error: "internal_error" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }
        }

        if (request.method === "POST") {
          let body: any = null;
          try {
            body = bodyText ? JSON.parse(bodyText) : null;
          } catch {
            body = null;
          }

          if (!body || !body.id || !body.email || !body.full_name) {
            return new Response(JSON.stringify({ error: "invalid_payload" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          try {
            const rows = await readProfileStore();
            const now = new Date().toISOString();
            const nextProfile = normalizeLocalProfile({
              id: String(body.id),
              full_name: String(body.full_name),
              email: String(body.email),
              phone: body.phone == null ? "" : String(body.phone),
              avatar_url: body.avatar_url == null ? "" : String(body.avatar_url),
              created_at: typeof body.created_at === "string" ? body.created_at : now,
              updated_at: now,
            });
            const nextRows = [
              nextProfile,
              ...rows.filter((profile) => profile.id !== nextProfile.id),
            ];
            await writeProfileStore(nextRows);
            return new Response(JSON.stringify({ ok: true, id: nextProfile.id }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          } catch (err) {
            console.error("Failed to sync profile:", err);
            return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }
        }

        return new Response(JSON.stringify({ error: "method_not_allowed" }), {
          status: 405,
          headers: { "content-type": "application/json" },
        });
      }

      // Protected admin API for programmatic user creation.
      if (url.pathname === "/__admin/enquiries") {
        let authorized = false;
        try {
          authorized = await requireAdmin(request);
        } catch {
          authorized = false;
        }
        if (!authorized) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const devAdminUrl = process.env.DEV_ADMIN_URL || "";

        let bodyText: string | undefined = undefined;
        try {
          bodyText = await request.text();
        } catch {
          bodyText = undefined;
        }

        if (devAdminUrl && process.env.NODE_ENV !== "production") {
          try {
            const proxiedUrl = new URL("/__admin/enquiries", devAdminUrl);
            proxiedUrl.search = url.search;
            const proxiedWithPath = await fetch(proxiedUrl, {
              method: request.method,
              headers: request.headers as HeadersInit,
              body: bodyText && bodyText.length > 0 ? bodyText : undefined,
            });
            const proxiedBody = await proxiedWithPath.arrayBuffer();
            const headers: Record<string, string> = {};
            proxiedWithPath.headers.forEach((value, key) => {
              headers[key] = value;
            });
            return new Response(proxiedBody, { status: proxiedWithPath.status, headers });
          } catch (err) {
            console.warn(
              "Failed to proxy /__admin/enquiries to DEV_ADMIN_URL, falling back to embedded admin:",
              err,
            );
          }
        }

        if (
          request.method !== "GET" &&
          request.method !== "POST" &&
          request.method !== "PATCH" &&
          request.method !== "DELETE"
        ) {
          return new Response(JSON.stringify({ error: "method_not_allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
          });
        }

        let admin: FirebaseAdminModule | null = null;
        try {
          admin = await initFirebaseAdmin();
        } catch (err) {
          console.warn("Failed to initialize embedded admin for enquiries:", err);
        }

        const getApps = admin
          ? (admin as unknown as { getApps?: () => unknown[]; apps?: unknown[] }).getApps
          : undefined;
        const existingApps = admin
          ? typeof getApps === "function"
            ? getApps()
            : ((admin as unknown as { apps?: unknown[] }).apps ?? [])
          : [];

        if (!admin || existingApps.length === 0) {
          const localEnquiries = getLocalEnquiries();

          if (request.method === "GET") {
            return new Response(JSON.stringify(localEnquiries), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          const body = parseLocalEnquiryBody(bodyText);

          if (request.method === "POST") {
            if (!body || !body.customer_name || !body.email || !body.phone || !body.destination) {
              return new Response(JSON.stringify({ error: "invalid_payload" }), {
                status: 400,
                headers: { "content-type": "application/json" },
              });
            }

            const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const record = toLocalEnquiryRow({
              id,
              customer_name: String(body.customer_name),
              email: String(body.email),
              phone: String(body.phone),
              destination: String(body.destination),
              status: String(body.status || "pending"),
              assigned_staff_number: Number.isFinite(Number(body.assigned_staff_number))
                ? Number(body.assigned_staff_number)
                : 0,
              travelers:
                body.travelers == null || body.travelers === "" ? null : Number(body.travelers),
              travel_date: body.travel_date ? String(body.travel_date) : null,
              message: body.message ? String(body.message) : null,
            });
            localEnquiries.unshift(record);
            return new Response(JSON.stringify({ id }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          if (request.method === "DELETE") {
            if (!body || !body.id) {
              return new Response(JSON.stringify({ error: "invalid_payload" }), {
                status: 400,
                headers: { "content-type": "application/json" },
              });
            }

            const id = String(body.id);
            const index = localEnquiries.findIndex((item) => item.id === id);
            if (index < 0) {
              return new Response(JSON.stringify({ error: "not_found" }), {
                status: 404,
                headers: { "content-type": "application/json" },
              });
            }

            localEnquiries.splice(index, 1);
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          if (!body || !body.id || !body.status) {
            return new Response(JSON.stringify({ error: "invalid_payload" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const id = String(body.id);
          const enquiry = localEnquiries.find((item) => item.id === id);
          if (!enquiry) {
            return new Response(JSON.stringify({ error: "not_found" }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }

          enquiry.status = String(body.status);
          enquiry.updated_at = new Date().toISOString();
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const db = admin.firestore();
          const enquiriesRef = db.collection("enquiries");

          if (request.method === "GET") {
            const snapshot = await enquiriesRef.orderBy("created_at", "desc").limit(200).get();
            const enquiries = snapshot.docs.map((docSnap) =>
              serializeEnquiryDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
            );
            return new Response(JSON.stringify(enquiries), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          let body: any = null;
          try {
            body = await request.json();
          } catch {
            body = null;
          }

          if (request.method === "POST") {
            if (!body || !body.customer_name || !body.email || !body.phone || !body.destination) {
              return new Response(JSON.stringify({ error: "invalid_payload" }), {
                status: 400,
                headers: { "content-type": "application/json" },
              });
            }

            const docRef = await enquiriesRef.add({
              customer_name: String(body.customer_name),
              email: String(body.email),
              phone: String(body.phone),
              destination: String(body.destination),
              status: String(body.status || "pending"),
              assigned_staff_number: Number.isFinite(Number(body.assigned_staff_number))
                ? Number(body.assigned_staff_number)
                : 0,
              travelers:
                body.travelers == null || body.travelers === "" ? null : Number(body.travelers),
              travel_date: body.travel_date ? String(body.travel_date) : null,
              message: body.message ? String(body.message) : null,
              created_at: admin.firestore.FieldValue.serverTimestamp(),
            });

            return new Response(JSON.stringify({ id: docRef.id }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          if (request.method === "DELETE") {
            if (!body || !body.id) {
              return new Response(JSON.stringify({ error: "invalid_payload" }), {
                status: 400,
                headers: { "content-type": "application/json" },
              });
            }

            const docRef = enquiriesRef.doc(String(body.id));
            const snapshot = await docRef.get();

            if (!snapshot.exists) {
              return new Response(JSON.stringify({ error: "not_found" }), {
                status: 404,
                headers: { "content-type": "application/json" },
              });
            }

            await docRef.delete();
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }

          if (!body || !body.id || !body.status) {
            return new Response(JSON.stringify({ error: "invalid_payload" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          await enquiriesRef.doc(String(body.id)).set(
            {
              status: String(body.status),
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          console.warn("Embedded enquiries handler failed:", err);
          if (request.method === "GET") {
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ error: "admin_unavailable" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // Proxy analytics endpoints to local dev admin server when available
      if (url.pathname === "/__admin/analytics" || url.pathname === "/__admin/analytics/visit") {
        const devAdminUrl = process.env.DEV_ADMIN_URL || "";
        let bodyText: string | undefined = undefined;
        try {
          bodyText = await request.text();
        } catch {
          bodyText = undefined;
        }

        if (devAdminUrl && process.env.NODE_ENV !== "production") {
          try {
            const proxiedUrl = new URL(url.pathname, devAdminUrl);
            proxiedUrl.search = url.search;
            const proxiedWithPath = await fetch(proxiedUrl, {
              method: request.method,
              headers: request.headers as HeadersInit,
              body: bodyText && bodyText.length > 0 ? bodyText : undefined,
            });
            const proxiedBody = await proxiedWithPath.arrayBuffer();
            const headers: Record<string, string> = {};
            proxiedWithPath.headers.forEach((value, key) => {
              headers[key] = value;
            });
            return new Response(proxiedBody, { status: proxiedWithPath.status, headers });
          } catch (err) {
            console.warn(
              "Failed to proxy /__admin/analytics to DEV_ADMIN_URL, falling back to embedded admin:",
              err,
            );
          }
        }

        // Embedded analytics handler not implemented here; require dev admin server.
        return new Response(JSON.stringify({ error: "admin_not_initialized" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }

      if (url.pathname === "/__admin/create-user") {
        // Read request body once so we can reuse it for proxy or fallback handling.
        const devAdminUrl = process.env.DEV_ADMIN_URL || "";
        let bodyText: string | undefined = undefined;
        try {
          bodyText = await request.text();
        } catch (e) {
          // ignore - body may be empty
        }

        // If a local dev admin server is configured, proxy the request to it.
        if (devAdminUrl && process.env.NODE_ENV !== "production") {
          try {
            const proxied = await fetch(devAdminUrl, {
              method: request.method,
              headers: request.headers as HeadersInit,
              body: bodyText && bodyText.length > 0 ? bodyText : undefined,
            });
            // return proxied response as-is
            const proxiedBody = await proxied.arrayBuffer();
            const headers: Record<string, string> = {};
            proxied.headers.forEach((v, k) => (headers[k] = v));
            return new Response(proxiedBody, { status: proxied.status, headers });
          } catch (err) {
            console.warn("Failed to proxy to DEV_ADMIN_URL, falling back to embedded admin:", err);
          }
        }
        // Simple header-based auth using ADMIN_API_KEY or a Firebase ID token.
        const adminKey = process.env.ADMIN_API_KEY || "";
        const provided = request.headers.get("x-admin-key") || "";

        let authorized = false;
        if (adminKey && provided === adminKey) {
          authorized = true;
        } else {
          const authorization = request.headers.get("authorization") || "";
          const token = authorization.toLowerCase().startsWith("bearer ")
            ? authorization.slice(7).trim()
            : "";

          if (token) {
            try {
              const admin = await initFirebaseAdmin();
              if (!admin) {
                throw new Error("admin_not_initialized");
              }

              const decoded = await admin.auth().verifyIdToken(token);
              if (decoded.role === "admin") {
                authorized = true;
              } else if (decoded.uid) {
                const roleDoc = await admin
                  .firestore()
                  .collection("user_roles")
                  .doc(decoded.uid)
                  .get();
                authorized = roleDoc.exists && roleDoc.data()?.role === "admin";
              }
            } catch (err) {
              console.warn("Firebase auth authorization failed for create-user endpoint:", err);
            }
          }
        }

        if (!authorized) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "method_not_allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
          });
        }

        const admin = await initFirebaseAdmin();
        const getApps = (admin as unknown as { getApps?: () => unknown[]; apps?: unknown[] })
          .getApps;
        const existingApps =
          typeof getApps === "function"
            ? getApps()
            : ((admin as unknown as { apps?: unknown[] }).apps ?? []);

        if (!admin || existingApps.length === 0) {
          return new Response(JSON.stringify({ error: "admin_not_initialized" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        let body: any = null;
        if (bodyText && bodyText.length > 0) {
          try {
            body = JSON.parse(bodyText);
          } catch (e) {
            body = null;
          }
        } else {
          body = await request.json().catch(() => null);
        }
        if (!body || !body.email) {
          return new Response(JSON.stringify({ error: "invalid_payload" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const { email, password, displayName, role, phone, staff_number } = body as any;

        try {
          let userRecord;
          try {
            userRecord = await admin.auth().getUserByEmail(email);
            // set claims if provided
            if (role) await admin.auth().setCustomUserClaims(userRecord.uid, { role });
            // ensure staff_profiles doc exists
          } catch (getErr) {
            // create
            userRecord = await admin
              .auth()
              .createUser({
                email,
                password: password || Math.random().toString(36).slice(2),
                displayName,
              });
            if (role) await admin.auth().setCustomUserClaims(userRecord.uid, { role });
          }

          const db = admin.firestore();
          const resolvedName = userRecord.displayName || displayName || "";
          const resolvedRole = role || "staff";
          await Promise.all([
            db
              .collection("profiles")
              .doc(userRecord.uid)
              .set(
                {
                  full_name: resolvedName,
                  email: userRecord.email,
                  phone: phone || "",
                  created_at: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              ),
            db.collection("user_roles").doc(userRecord.uid).set(
              {
                full_name: resolvedName,
                email: userRecord.email,
                role: resolvedRole,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            ),
            db
              .collection("staff_profiles")
              .doc(userRecord.uid)
              .set(
                {
                  id: userRecord.uid,
                  user_id: userRecord.uid,
                  email: userRecord.email,
                  full_name: resolvedName,
                  staff_number: Number.isFinite(Number(staff_number)) ? Number(staff_number) : 1,
                  active: true,
                  created_at: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              ),
          ]);

          return new Response(JSON.stringify({ uid: userRecord.uid }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          console.error("Admin create-user error:", err);
          return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return normalized;
    } catch (error) {
      console.error("[SSR fatal]", error);
      // Helpful: print any React element type mismatch with extra inspection.
      try {
        const anyErr = error as any;
        console.error(
          "[SSR fatal] name:",
          anyErr?.name,
          " message:",
          anyErr?.message,
          " type:",
          typeof anyErr,
        );
        console.error("[SSR fatal] stack:\n", anyErr?.stack);
      } catch {
        // ignore
      }
      return brandedErrorResponse();
    }
  },
};
