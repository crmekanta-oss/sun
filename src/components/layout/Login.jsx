import React, { useState } from "react";
import { F_BODY, F_MONO, F_SERIF, F } from "../../theme/index.js";
import { Ic, P } from "../ui/index.jsx";

export function Login({ users, onLogin, T, dark, onToggleDark }) {
  const [u, su] = useState("");
  const [p, sp] = useState("");
  const [err, se] = useState("");
  const [load, sl] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const go = () => {
    const trimU = u.trim().toLowerCase();
    const trimP = p.trim();
    if (!trimU || !trimP) { se("Please fill in all fields."); return; }
    se(""); sl(true);
    setTimeout(() => {
      const found = users.find(x => x.username.toLowerCase() === trimU && x.password === trimP);
      if (found) onLogin(found);
      else { se("Incorrect username or password."); sl(false); }
    }, 700);
  };

  const metrics = [
    { value: "100%", label: "Uptime" },
    { value: "Real-time", label: "Sync" },
    { value: "9+", label: "Users" },
  ];

  const features = [
    { icon: "📊", title: "Live Pipeline", desc: "Track every lead from first contact to closed deal in real-time" },
    { icon: "🔔", title: "Smart Follow-ups", desc: "Never miss a follow-up with intelligent overdue alerts" },
    { icon: "💰", title: "Revenue Analytics", desc: "Deep insights on pipeline value, win rates, and team performance" },
    { icon: "👥", title: "Team Management", desc: "Assign leads, set targets, and monitor CRE performance" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: F_BODY }}>

      {/* ── Left branding panel ── */}
      <div className="ek-login-left" style={{
        width: "55%", minHeight: "100vh",
        background: "linear-gradient(145deg, #0a0d14 0%, #111928 60%, #0d1520 100%)",
        padding: "56px 64px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, rgba(77,124,254,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: "linear-gradient(135deg, #4d7cfe, #3d6cf0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(77,124,254,0.4)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: "#f0f4ff" }}>Suntronix CRM</div>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(77,124,254,0.7)", marginTop: 1 }}>v2.0 · Enterprise Edition</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: F_SERIF, fontSize: 42, fontWeight: 400, color: "#f0f4ff", lineHeight: 1.15, letterSpacing: "-0.5px", margin: "0 0 16px" }}>
              Close more deals.<br />
              <em style={{ fontStyle: "italic", color: "#4d7cfe" }}>Grow faster.</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(240,244,255,0.45)", lineHeight: 1.8, maxWidth: 380, margin: 0 }}>
              A world-class CRM built for high-performance sales teams. Track every lead, follow up on time, and close more deals.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, animation: `fadeUp .5s ease ${i * 0.08}s both` }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: "1px solid rgba(77,124,254,0.25)",
                  background: "rgba(77,124,254,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 17,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(240,244,255,0.38)", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom metrics */}
        <div style={{ position: "relative", zIndex: 1, paddingTop: 32, borderTop: "1px solid rgba(77,124,254,0.15)", display: "flex", gap: 40 }}>
          {metrics.map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.5px", fontFamily: F_BODY }}>{m.value}</div>
              <div style={{ fontSize: 11, fontFamily: F_MONO, color: "rgba(240,244,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", position: "relative",
      }}>
        {/* Dark toggle */}
        <button onClick={onToggleDark} title={dark ? "Light mode" : "Dark mode"} style={{
          position: "absolute", top: 24, right: 24,
          width: 36, height: 36, borderRadius: 9,
          background: T.surfaceEl, border: `1px solid ${T.line}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .14s",
        }}>
          <Ic d={dark ? P.sun : P.moon} sz={15} color={T.inkMuted} />
        </button>

        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Form header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `linear-gradient(135deg, ${T.brand}, ${T.brandHover})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px ${T.brand}44`,
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Suntronix CRM</div>
                <div style={{ fontSize: 10, fontFamily: F_MONO, color: T.inkMuted, letterSpacing: "0.08em" }}>Enterprise</div>
              </div>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: T.ink, letterSpacing: "-0.4px", margin: "0 0 6px" }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: T.inkMuted, margin: 0, lineHeight: 1.5 }}>Sign in to your workspace to continue.</p>
          </div>

          {/* Error */}
          {err && (
            <div style={{
              background: T.lost.bg, border: `1px solid ${T.lost.dot}33`,
              borderLeft: `3px solid ${T.lost.dot}`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 18,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Ic d={P.close} sz={14} color={T.lost.dot} />
              <span style={{ fontSize: 12, color: T.lost.text, fontFamily: F_BODY }}>{err}</span>
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.inkSub, marginBottom: 6, letterSpacing: "0.02em" }}>Username</label>
            <input
              value={u} onChange={e => su(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              placeholder="Enter your username"
              autoFocus
              style={{
                width: "100%", height: 42, borderRadius: 9,
                border: `1.5px solid ${T.line}`, background: T.surface,
                color: T.ink, fontSize: 13, padding: "0 14px",
                fontFamily: F_BODY, outline: "none",
                transition: "border-color .15s, box-shadow .15s",
              }}
              onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.boxShadow = `0 0 0 3px rgba(${T.brandRgb},0.15)`; }}
              onBlur={e => { e.target.style.borderColor = T.line; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.inkSub, marginBottom: 6, letterSpacing: "0.02em" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={p} onChange={e => sp(e.target.value)}
                onKeyDown={e => e.key === "Enter" && go()}
                placeholder="Enter your password"
                style={{
                  width: "100%", height: 42, borderRadius: 9,
                  border: `1.5px solid ${T.line}`, background: T.surface,
                  color: T.ink, fontSize: 13, padding: "0 42px 0 14px",
                  fontFamily: F_BODY, outline: "none",
                  transition: "border-color .15s, box-shadow .15s",
                }}
                onFocus={e => { e.target.style.borderColor = T.brand; e.target.style.boxShadow = `0 0 0 3px rgba(${T.brandRgb},0.15)`; }}
                onBlur={e => { e.target.style.borderColor = T.line; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={() => setShowPw(x => !x)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: T.inkMuted,
                display: "flex", alignItems: "center",
              }}>
                <Ic d={showPw ? P.eye : P.eye} sz={15} color={T.inkMuted} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={go}
            disabled={load}
            style={{
              width: "100%", height: 44, borderRadius: 10,
              background: load ? T.inkMuted : T.brand, border: "none",
              color: "#fff", fontSize: 14, fontWeight: 700,
              fontFamily: F_BODY, cursor: load ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background .14s", boxShadow: load ? "none" : `0 4px 16px ${T.brand}44`,
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { if (!load) e.currentTarget.style.background = T.brandHover; }}
            onMouseLeave={e => { if (!load) e.currentTarget.style.background = T.brand; }}>
            {load ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                Signing in…
              </>
            ) : "Sign in →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: T.inkMuted, marginTop: 20, lineHeight: 1.6 }}>
            Contact your administrator for access.<br />
            <span style={{ fontFamily: F_MONO, fontSize: 10 }}>Secured · Role-based access control</span>
          </p>
        </div>
      </div>
    </div>
  );
}
