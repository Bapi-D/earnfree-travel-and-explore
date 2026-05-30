import React from 'react';

function getCookie(name: string) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
}

export default function CookieConsent() {
  const [visible, setVisible] = React.useState(false);
  const [consent, setConsent] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const c = getCookie('earnfree_analytics_consent');
      setConsent(c);
      setVisible(c === null);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try { setCookie('earnfree_analytics_consent', 'true', 365); } catch {}
    try { setCookie('earnfree_visitor_id_consent', 'true', 365); } catch {}
    setConsent('true');
    setVisible(false);
    // set reduced-motion preference cookie
    try { const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; setCookie('earnfree_reduce_motion', reduce ? '1' : '0', 365); } catch {}
    window.dispatchEvent(new Event('earnfree-consent-changed'));
  }

  function decline() {
    try { setCookie('earnfree_analytics_consent', 'false', 365); } catch {}
    setConsent('false');
    setVisible(false);
    window.dispatchEvent(new Event('earnfree-consent-changed'));
  }

  if (!visible) return null;

  return (
    <div className="fixed left-4 right-4 bottom-6 z-[99999] rounded-2xl bg-card/95 border border-border p-4 shadow-xl flex items-center gap-4">
      <div className="flex-1">
        <div className="font-semibold">We use cookies for analytics</div>
        <div className="text-sm text-muted-foreground">We collect anonymous visitor metrics to improve the site. You can accept or decline.</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={decline} className="px-3 py-2 rounded-md border">Decline</button>
        <button onClick={accept} className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Accept</button>
      </div>
    </div>
  );
}
