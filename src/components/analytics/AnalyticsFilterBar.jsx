import React from "react";
import { F, F_MONO } from "../../theme/index.js";
import { Dot } from "../ui/index.jsx";

const PRESETS = [
  ["all","All Time"],["today","Today"],["week","This Week"],
  ["month","This Month"],["last30","Last 30d"],["last3m","Last 3M"],["year","This Year"],["custom","Custom"]
];
const TABS = [
  { id:"overview", label:"Overview",  emoji:"📊" },
  { id:"pipeline", label:"Pipeline",  emoji:"🔄" },
  { id:"team",     label:"Team",      emoji:"👥" },
  { id:"products", label:"Products",  emoji:"🏷️" },
];

export function AnalyticsFilterBar({ preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, compareOn, setCompareOn, cmpFrom, setCmpFrom, cmpTo, setCmpTo, granularity, setGranularity, activeTab, setActiveTab, curr, cmp, CM, rangeLabel, T }) {
  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.line}` }}>
      {/* Preset row */}
      <div style={{ padding: "12px 20px 0", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
          {PRESETS.map(([id, label]) => (
            <button key={id} onClick={() => setPreset(id)}
              style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: preset===id ? 700 : 400, fontFamily: F, border: `1.5px solid ${preset===id ? T.brand : T.line}`, background: preset===id ? T.brand : "transparent", color: preset===id ? "#fff" : T.inkSub, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap", marginBottom: 8 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Granularity */}
        <div style={{ display: "flex", background: T.surfaceEl, border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden", flexShrink: 0, marginBottom: 8 }}>
          {["daily","weekly","monthly"].map(g => (
            <button key={g} onClick={() => setGranularity(g)}
              style={{ padding: "5px 12px", fontSize: 11, fontWeight: granularity===g ? 700 : 400, fontFamily: F_MONO, border: "none", cursor: "pointer", background: granularity===g ? T.brand : "transparent", color: granularity===g ? "#fff" : T.inkSub, textTransform: "uppercase", letterSpacing: "0.06em", transition: "all .15s" }}>
              {g[0].toUpperCase()+g.slice(1)}
            </button>
          ))}
        </div>

        {/* Compare toggle */}
        <button onClick={() => setCompareOn(x => !x)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: F, border: `1.5px solid ${compareOn ? T.brand : T.line}`, background: compareOn ? T.brandSubtle : "transparent", color: compareOn ? T.brand : T.inkSub, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap", marginBottom: 8 }}>
          ⚡ {compareOn ? "Comparing" : "Compare"}
        </button>
      </div>

      {/* Custom range / compare inputs */}
      {(preset === "custom" || compareOn) && (
        <div style={{ padding: "10px 20px", display: "flex", gap: 20, flexWrap: "wrap", borderBottom: `1px solid ${T.line}` }}>
          {preset === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.inkMuted, fontFamily: F_MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>Range</span>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ padding: "5px 10px", border: `1px solid ${T.lineMid}`, borderRadius: 7, fontSize: 12, fontFamily: F, color: T.ink, background: T.surface, outline: "none" }} />
              <span style={{ color: T.inkMuted }}>→</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ padding: "5px 10px", border: `1px solid ${T.lineMid}`, borderRadius: 7, fontSize: 12, fontFamily: F, color: T.ink, background: T.surface, outline: "none" }} />
            </div>
          )}
          {compareOn && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.brand, fontFamily: F_MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>⚡ vs</span>
              <input type="date" value={cmpFrom} onChange={e => setCmpFrom(e.target.value)} style={{ padding: "5px 10px", border: `1.5px solid ${T.brand}44`, borderRadius: 7, fontSize: 12, fontFamily: F, color: T.ink, background: `rgba(${T.brandRgb||"154,122,69"},0.06)`, outline: "none" }} />
              <span style={{ color: T.inkMuted }}>→</span>
              <input type="date" value={cmpTo} onChange={e => setCmpTo(e.target.value)} style={{ padding: "5px 10px", border: `1.5px solid ${T.brand}44`, borderRadius: 7, fontSize: 12, fontFamily: F, color: T.ink, background: `rgba(${T.brandRgb||"154,122,69"},0.06)`, outline: "none" }} />
            </div>
          )}
        </div>
      )}

      {/* Tabs row */}
      <div style={{ display: "flex", padding: "0 20px", alignItems: "center" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "12px 18px", fontSize: 13, fontWeight: activeTab===tab.id ? 700 : 400, fontFamily: F, border: "none", borderBottom: `2.5px solid ${activeTab===tab.id ? T.brand : "transparent"}`, background: "transparent", color: activeTab===tab.id ? T.brand : T.inkSub, cursor: "pointer", transition: "all .15s", marginBottom: -1, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 14 }}>{tab.emoji}</span>{tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.04em" }}>
          {curr.length} leads · {rangeLabel}
          {compareOn && CM && <span style={{ color: T.brand, marginLeft: 8 }}>⚡ vs {cmp.length}</span>}
        </div>
      </div>
    </div>
  );
}
