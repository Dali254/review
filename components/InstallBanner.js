import { useState, useEffect } from 'react';
import Icon from '../lib/icons';
import { usePushNotifications } from '../lib/usePushNotifications';

const DISMISS_KEY = 'reviewke_install_banner_dismissed';

// Prompts the user to (1) install ReviewKE to their home screen and
// (2) turn on notifications, so they get pinged about new paid review
// jobs even when the app isn't open. Shows once per device unless
// dismissed; reappears if conditions change (e.g. they install but
// haven't enabled notifications yet).
export default function InstallBanner({ phone }) {
  const {
    supported, permission, subscribed, loading, isInstalled,
    canPromptInstall, subscribe, promptInstall,
  } = usePushNotifications(phone);

  const [dismissed, setDismissed] = useState(true); // default hidden until we check localStorage, avoids flash
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === 'true');
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  }

  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const needsNotifications = supported && permission !== 'granted' && !subscribed;
  const needsInstall = !isInstalled;

  // Nothing to offer: already installed + already subscribed, or push
  // isn't supported at all (older browser) and the user dismissed it.
  if (dismissed) return null;
  if (isInstalled && subscribed) return null;
  if (!supported && !needsInstall) return null;

  async function handleEnableNotifications() {
    const ok = await subscribe();
    if (!ok && Notification.permission === 'denied') {
      // Permission was actively denied — nothing more we can do
      // programmatically; leave the banner so they see the explanation.
    }
  }

  return (
    <div className="glass-card" style={{
      borderRadius: 16, padding: '14px 16px', marginBottom: 18,
      background: 'var(--brand-gradient-soft)', border: '1.5px solid var(--purple-mid)',
      display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative',
    }}>
      <button onClick={dismiss} aria-label="Dismiss" style={{
        position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 8,
        background: 'rgba(255,255,255,0.6)', border: 'none', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
      }}>
        <Icon.X size={12} />
      </button>

      <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-glow-purple)' }}>
        <Icon.BarChart size={18} style={{ color: '#fff' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>
          {needsInstall ? 'Install ReviewKE & get notified' : 'Turn on notifications'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
          {needsInstall
            ? 'Add ReviewKE to your home screen and we\'ll alert you the moment a new paid review job opens — even when the app is closed.'
            : 'Get alerted the moment a new paid review job opens — even when the app is closed.'}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {needsInstall && canPromptInstall && (
            <button onClick={promptInstall} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow-purple)',
            }}>
              <Icon.ArrowRight size={13} /> Install app
            </button>
          )}

          {needsInstall && !canPromptInstall && isIos && (
            <button onClick={() => setShowIosHelp(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: '#fff', color: 'var(--purple)', border: '1.5px solid var(--purple-mid)', borderRadius: 9,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}>
              <Icon.Info size={13} /> How to install on iPhone
            </button>
          )}

          {needsNotifications && (!needsInstall || isInstalled) && (
            <button onClick={handleEnableNotifications} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'var(--brand-gradient)', color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 12.5, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, boxShadow: 'var(--shadow-glow-purple)',
            }}>
              <Icon.Zap size={13} /> {loading ? 'Enabling...' : 'Enable notifications'}
            </button>
          )}

          {permission === 'denied' && (
            <span style={{ fontSize: 11.5, color: '#e53e3e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.Info size={12} /> Notifications blocked — enable them in your browser's site settings
            </span>
          )}
        </div>

        {showIosHelp && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 10, border: '1px solid var(--border)' }}>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>Tap the <strong>Share</strong> button in Safari (the square with an arrow)</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li>Open ReviewKE from your home screen, then enable notifications from there</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
