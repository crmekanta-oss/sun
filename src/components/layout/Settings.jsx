import React, { useState } from "react";
import { F, F_MONO, F_SERIF, THEMES } from "../../theme/index.js";
import { Ic, P, Btn, FInput, FSelect, Avatar, Dot } from "../ui/index.jsx";
import { SEED_USERS } from "../../constants.js";

const SETTING_KEY = "ek_settings_v1";
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTING_KEY) || "{}"); } catch { return {}; }
}
function saveSettings(s) {
  try { localStorage.setItem(SETTING_KEY, JSON.stringify(s)); } catch {}
}

const Section = ({ title, sub, icon, children, T }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden", boxShadow: T.shadowSm }}>
    <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: T.brandSubtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, fontFamily: F }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.inkMuted, fontFamily: F, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
    <div style={{ padding: "20px 24px" }}>{children}</div>
  </div>
);

const Toggle = ({ label, sub, value, onChange, T }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, fontFamily: F }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F, marginTop: 2 }}>{sub}</div>}
    </div>
    <button onClick={() => onChange(!value)}
      style={{ width: 46, height: 26, borderRadius: 13, border: "none", background: value ? T.brand : T.lineMid, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  </div>
);

export function Settings({ T, themeId, setTheme, dark, onToggleDark, user, onLogout, funnels }) {
  const [prefs, setPrefs] = useState(() => ({ ...{ compactTable: false, showAvatars: true, animateCharts: true, defaultView: "dashboard", currency: "INR", dateFormat: "DD/MM/YYYY" }, ...loadSettings() }));
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [tab, setTab] = useState("appearance");

  const sp = (k, v) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next); saveSettings(next);
  };

  const tabs = [
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "account", label: "Account", icon: "👤" },
    { id: "data", label: "Data & Privacy", icon: "🔒" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];

  // Data stats
  const won = funnels.filter(f => f.status === "Won").length;
  const totalRev = funnels.filter(f => f.status === "Won").reduce((a, f) => a + (Number(f.quoteAmount) || 0), 0);

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: F }}>
      {/* Left sidebar */}
      <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.line}`, background: T.sidebar, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 10px 10px" }}>Settings</div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: tab === t.id ? T.brandSubtle : "transparent", color: tab === t.id ? T.brand : T.inkSub, cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, fontFamily: F, transition: "all .15s", width: "100%" }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = T.surfaceEl; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: T.bg }}>

        {/* ── APPEARANCE ── */}
        {tab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 780 }}>
            <Section T={T} icon="🌗" title="Light / Dark Mode" sub="Switch between light and dark appearance">
              <div style={{ display: "flex", gap: 12 }}>
                {[{ id: false, label: "Light", icon: "☀️" }, { id: true, label: "Dark", icon: "🌙" }].map(m => (
                  <button key={String(m.id)} onClick={() => { if (dark !== m.id) onToggleDark(); }}
                    style={{ flex: 1, padding: "16px", borderRadius: 10, border: `2px solid ${dark === m.id ? T.brand : T.line}`, background: dark === m.id ? T.brandSubtle : T.surfaceEl, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .15s" }}>
                    <span style={{ fontSize: 28 }}>{m.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: dark === m.id ? 700 : 500, color: dark === m.id ? T.brand : T.inkSub, fontFamily: F }}>{m.label}</span>
                    {dark === m.id && <span style={{ fontSize: 10, color: T.brand, fontFamily: F_MONO, fontWeight: 600 }}>ACTIVE</span>}
                  </button>
                ))}
              </div>
            </Section>

            <Section T={T} icon="🎨" title="Color Theme" sub="Choose a color palette that matches your style">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {Object.entries(THEMES).map(([id, theme]) => {
                  const base = dark ? theme.dark : theme.light;
                  const active = themeId === id;
                  return (
                    <button key={id} onClick={() => setTheme(id)}
                      style={{ padding: "16px 12px", borderRadius: 12, border: `2px solid ${active ? base.brand : T.line}`, background: base.bg, cursor: "pointer", transition: "all .18s", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.transform = "scale(1.03)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                      {/* Preview swatch */}
                      <div style={{ display: "flex", gap: 4, marginBottom: 10, justifyContent: "center" }}>
                        {[base.brand, "#16a34a", "#d97706", "#dc2626"].map((c, i) => (
                          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 20, marginBottom: 4, textAlign: "center" }}>{theme.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: base.ink, fontFamily: F, textAlign: "center" }}>{theme.name}</div>
                      <div style={{ fontSize: 10, color: base.inkMuted, fontFamily: F, textAlign: "center", marginTop: 2 }}>{theme.desc}</div>
                      {active && (
                        <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: base.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {tab === "preferences" && (
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
            <Section T={T} icon="⚙️" title="Display Preferences" sub="Customize how data appears">
              <Toggle label="Compact table rows" sub="Show more rows with less padding" value={prefs.compactTable} onChange={v => sp("compactTable", v)} T={T} />
              <Toggle label="Show avatars" sub="Display profile pictures in lists" value={prefs.showAvatars} onChange={v => sp("showAvatars", v)} T={T} />
              <Toggle label="Animate charts" sub="Enable chart transition animations" value={prefs.animateCharts} onChange={v => sp("animateCharts", v)} T={T} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, fontFamily: F }}>Default landing page</div>
                  <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F, marginTop: 2 }}>Which page to open after login</div>
                </div>
                <select value={prefs.defaultView} onChange={e => sp("defaultView", e.target.value)}
                  style={{ padding: "7px 12px", border: `1px solid ${T.lineMid}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: T.ink, background: T.surface, outline: "none", cursor: "pointer" }}>
                  {[["dashboard", "Dashboard"], ["funnels", "Funnels"], ["analytics", "Analytics"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </Section>

            <Section T={T} icon="🌐" title="Regional" sub="Language and format settings">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, fontFamily: F }}>Currency</div>
                <select value={prefs.currency} onChange={e => sp("currency", e.target.value)}
                  style={{ padding: "7px 12px", border: `1px solid ${T.lineMid}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: T.ink, background: T.surface, outline: "none" }}>
                  {[["INR", "₹ Indian Rupee"], ["USD", "$ US Dollar"], ["EUR", "€ Euro"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, fontFamily: F }}>Date format</div>
                <select value={prefs.dateFormat} onChange={e => sp("dateFormat", e.target.value)}
                  style={{ padding: "7px 12px", border: `1px solid ${T.lineMid}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: T.ink, background: T.surface, outline: "none" }}>
                  {[["DD/MM/YYYY", "DD/MM/YYYY"], ["MM/DD/YYYY", "MM/DD/YYYY"], ["YYYY-MM-DD", "YYYY-MM-DD"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </Section>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {tab === "account" && (
          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
            <Section T={T} icon="👤" title="Your Profile" sub="Your account details">
              <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "8px 0 20px", borderBottom: `1px solid ${T.line}`, marginBottom: 16 }}>
                <Avatar name={user.name} size={56} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 4 }}>@{user.username} · {user.role}</div>
                  <div style={{ display: "inline-flex", marginTop: 8, padding: "3px 10px", borderRadius: 20, background: T.brandSubtle, fontSize: 11, fontWeight: 600, color: T.brand }}>{user.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.inkMuted, fontFamily: F, padding: "10px 14px", background: T.surfaceEl, borderRadius: 8 }}>
                To update your name, username, or password, ask a CEO or Manager to edit your account in the Team section.
              </div>
            </Section>

            <Section T={T} icon="🚪" title="Sign Out" sub="End your current session">
              <p style={{ fontSize: 13, color: T.inkMuted, fontFamily: F, marginBottom: 16, lineHeight: 1.7 }}>
                You will be returned to the login screen. Your data is safely stored in the cloud.
              </p>
              <button onClick={onLogout}
                style={{ padding: "10px 24px", borderRadius: 9, border: `1px solid ${T.lost.dot}`, background: T.lost.bg, color: T.lost.text, fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={e => e.currentTarget.style.background = T.lost.bg}>
                Sign out of Suntronix CRM
              </button>
            </Section>
          </div>
        )}

        {/* ── DATA & PRIVACY ── */}
        {tab === "data" && (
          <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
            <Section T={T} icon="📊" title="Your Data Summary" sub="Overview of your CRM data">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Total Leads", value: funnels.length, color: T.brand },
                  { label: "Won Deals", value: won, color: T.won.dot },
                  { label: "Won Revenue", value: `₹${(totalRev/100000).toFixed(1)}L`, color: T.won.dot },
                ].map(s => (
                  <div key={s.label} style={{ background: T.surfaceEl, borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.line}` }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: F }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section T={T} icon="🔒" title="Privacy & Security" sub="Understand how your data is stored">
              {[
                { label: "Data storage", value: "Supabase (PostgreSQL) — cloud hosted" },
                { label: "Authentication", value: "Username + password (local session)" },
                { label: "Data encryption", value: "In-transit via HTTPS/TLS" },
                { label: "Password storage", value: "Plain text in DB — upgrade recommended" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.line}`, fontSize: 13, fontFamily: F }}>
                  <span style={{ color: T.inkMuted }}>{r.label}</span>
                  <span style={{ color: T.ink, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
                </div>
              ))}
            </Section>

            <Section T={T} icon="🗑️" title="Clear Local Data" sub="Remove locally cached data from this browser">
              <p style={{ fontSize: 13, color: T.inkMuted, fontFamily: F, marginBottom: 16, lineHeight: 1.7 }}>
                Clears tasks, notes, recently viewed, and preferences stored on this device. Your CRM data in the cloud is unaffected.
              </p>
              <button
                onClick={() => { ["ek_tasks_v1", "ek_targets_v1", "ek_recent", SETTING_KEY].forEach(k => localStorage.removeItem(k)); alert("Local data cleared."); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.lineMid}`, background: T.surfaceEl, color: T.inkSub, fontSize: 13, fontFamily: F, cursor: "pointer" }}>
                Clear local cache
              </button>
            </Section>
          </div>
        )}

        {/* ── ABOUT ── */}
        {tab === "about" && (
          <div style={{ maxWidth: 560 }}>
            <Section T={T} icon="ℹ️" title="About Suntronix CRM" sub="Version and build information">
              <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🏺</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, fontFamily: F, marginBottom: 6 }}>Suntronix CRM</div>
                <div style={{ fontSize: 13, color: T.inkMuted, fontFamily: F, marginBottom: 4 }}>Built for fashion & textile businesses</div>
                <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.06em" }}>v3.0.0 · 2025</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["Framework", "React 18 + Vite"],
                  ["Database", "Supabase (PostgreSQL)"],
                  ["Routing", "React Router v7"],
                  ["Fonts", "Inter, JetBrains Mono, Playfair Display"],
                  ["Themes", `${Object.keys(THEMES).length} built-in themes`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.line}`, fontSize: 13, fontFamily: F }}>
                    <span style={{ color: T.inkMuted }}>{k}</span>
                    <span style={{ color: T.ink, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
