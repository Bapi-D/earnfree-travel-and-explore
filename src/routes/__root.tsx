import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { Toaster } from "@/components/ui/sonner";
// SiteCursor removed to restore default cursor

import appCss from "../styles.css?url";
import { useEffect, useState } from "react";
import { recordVisit } from "@/lib/firebase-data";
import CookieConsent from '@/components/site/CookieConsent';
import Preloader from "@/components/ui/Preloader";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Earnfree Travel & Explore" },
      {
        name: "description",
        content:
          "Curated holiday packages, group tours, honeymoon getaways and adventure trips. Book Nepal, Bali, Dubai, Thailand, Kashmir & more with Earnfree.",
      },
      { name: "author", content: "Earnfree Travel & Explore" },
      { property: "og:title", content: "Earnfree Travel & Explore" },
      {
        property: "og:description",
        content:
          "Explore the world. Create memories. Premium travel packages curated for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@earnfree" },
      { name: "twitter:title", content: "Earnfree Travel & Explore" },
      {
        name: "twitter:description",
        content:
          "Explore the world. Create memories. Premium travel packages curated for you.",
      },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Sora:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const [mounted, setMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const key = "earnfree-preloader-seen";
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, "1");
        setShowPreloader(true);
      }
    } catch {
      setShowPreloader(true);
    }
    // record a simple visit event for analytics (once per session per path)
    try {
      const path = window.location.pathname + window.location.search;
      const visitKey = `earnfree-visit-sent:${path}`;
      const returningKey = 'earnfree-returning';
      const visitorKey = 'earnfree-visitor-id';

      function getCookie(name: string) {
        const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return m ? decodeURIComponent(m[2]) : null;
      }
      function setCookie(name: string, value: string, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
      }

      let visitorId = getCookie(visitorKey) || window.localStorage.getItem(visitorKey);
      if (!visitorId) {
        visitorId = `v_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
        try {
          setCookie(visitorKey, visitorId, 365);
        } catch {}
        try {
          window.localStorage.setItem(visitorKey, visitorId);
        } catch {}
      } else {
        // ensure cookie is present if only localStorage exists
        if (!getCookie(visitorKey)) {
          try { setCookie(visitorKey, visitorId, 365); } catch {}
        }
      }

      const already = window.sessionStorage.getItem(visitKey);
      const returning = Boolean(window.localStorage.getItem(returningKey));
      const consent = getCookie('earnfree_analytics_consent');
      if (consent === 'true') {
        if (!already) {
          window.sessionStorage.setItem(visitKey, '1');
          recordVisit({ path, userAgent: navigator.userAgent, device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop', returning, visitor_id: visitorId });
        }
      }
      if (!returning) window.localStorage.setItem(returningKey, '1');

      // register service worker for performance improvements (caching)
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
      } catch {}
    } catch (err) {
      // ignore
    }

    function onConsentChange() {
      try {
        const consent = getCookie('earnfree_analytics_consent');
        if (consent === 'true') {
          const path = window.location.pathname + window.location.search;
          const visitKey = `earnfree-visit-sent:${path}`;
          const already = window.sessionStorage.getItem(visitKey);
          const visitorId = getCookie('earnfree-visitor-id') || window.localStorage.getItem('earnfree-visitor-id');
          const returning = Boolean(window.localStorage.getItem('earnfree-returning'));
          if (!already) {
            window.sessionStorage.setItem(visitKey, '1');
            recordVisit({ path, userAgent: navigator.userAgent, device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop', returning, visitor_id: visitorId });
          }
        }
      } catch {}
    }

    window.addEventListener('earnfree-consent-changed', onConsentChange);
    return () => window.removeEventListener('earnfree-consent-changed', onConsentChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* SiteCursor removed to use the browser default cursor */}

        <div className="relative">
          <Outlet />
        </div>

        <AuthModal />
        <Toaster richColors position="top-right" />

        {mounted && showPreloader ? (
          <div
            className={`fixed inset-0 z-[9999999] transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
            aria-hidden
          >
            <Preloader
              onFinish={() => {
                setFadeOut(true);
                window.setTimeout(() => setShowPreloader(false), 520);
              }}
            />
          </div>
        ) : null}
        <CookieConsent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

