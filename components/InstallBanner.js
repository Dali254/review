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
  const [showHelp, setShowHelp] = useState(false);

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
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const needsNotifications = supported && permission !== 'granted' && !subscribed;
  const needsInstall = !isInstalled;

  // Nothing to offer: already installed + already subscribed, or push
  // isn't supported at all (older browser) and the user dismissed it.
  if (dismissed) return null;
  if (isInstalled && subscribed) return null;
  if (!supported && !needsInstall) return null;

  async function handleEnableNotifications() {
    await subscribe();
  }

  // The main button is ALWAYS clickable, regardless of whether the
  // browser fired its native beforeinstallprompt event — that event is
  // unreliable (Chrome engagement heuristics, never fires on iOS/Firefox
  // at all) so a button that only works when it happened to fire left
  // most visitors with a banner that looked clickable but did nothing.
  // If the native prompt is ready, use it; otherwise open clear
  // step-by-step instructions for the platform instead.
  function handleInstallClick() {
    if (canPromptInstall) {
      promptInstall();
    } else {
      setShowHelp(true);
    }
  }

  return (
    <div className="glass-card" style={{
      borderRadius: 18, padding: '18px 18px 18px 16px', marginBottom: 18,
      background: 'var(--brand-gradient)', border: 'none',
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
      boxShadow: 'var(--shadow-glow-purple)', overflow: 'hidden',
    }}>
      {/* Decorative glow orbs for visual interest */}
      <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: 40, width: 100, height: 100, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

      <button onClick={dismiss} aria-label="Dismiss" style={{
        position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 8,
        background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 2,
      }}>
        <Icon.X size={13} />
      </button>

      <div style={{
        width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 1,
      }}>
        <Icon.BarChart size={24} style={{ color: '#fff' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 22, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>
          {needsInstall ? 'Get the ReviewKE app' : 'Turn on notifications'}
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.5, marginBottom: 12 }}>
          {needsInstall
            ? 'Install to your home screen and get notified the instant a new paid review job opens.'
            : 'Get notified the instant a new paid review job opens — even when the app is closed.'}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {needsInstall && (
            <button onClick={handleInstallClick} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px',
              background: '#fff', color: 'var(--purple)', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'transform .15s',
            }}>
              <Icon.ArrowRight size={15} /> Install ReviewKE
            </button>
          )}

          {needsNotifications && !needsInstall && (
            <button onClick={handleEnableNotifications} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px',
              background: '#fff', color: 'var(--purple)', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}>
              <Icon.Zap size={15} /> {loading ? 'Enabling...' : 'Enable notifications'}
            </button>
          )}

          {permission === 'denied' && (
            <span style={{ fontSize: 11.5, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: 8 }}>
              <Icon.Info size={12} /> Blocked — enable in browser settings
            </span>
          )}
        </div>

        {showHelp && needsInstall && (
          <div style={{ marginTop: 14, padding: '14px 16px', background: '#fff', borderRadius: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              {isIos ? 'Install on iPhone / iPad' : isAndroid ? 'Install on Android' : 'Install on this browser'}
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
              {isIos ? (
                <>
                  <li>Tap the <strong>Share</strong> button in Safari (square with an arrow, in the toolbar)</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  <li>Tap <strong>Add</strong> — ReviewKE will appear on your home screen</li>
                </>
              ) : isAndroid ? (
                <>
                  <li>Tap the <strong>⋮</strong> menu in your browser (top right)</li>
                  <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
                  <li>Confirm — ReviewKE will appear on your home screen</li>
                </>
              ) : (
                <>
                  <li>Look for an <strong>install icon</strong> in your browser's address bar</li>
                  <li>Or open your browser menu and look for <strong>Install ReviewKE</strong></li>
                </>
              )}
            </ol>
            <button onClick={() => setShowHelp(false)} style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

