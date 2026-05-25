import React, { useMemo, useState } from "react";
import { F, F_MONO, F_BODY, F_SERIF } from "../../theme/index.js";
import { Dot, Avatar, StatusPill, SourcePill, Ic, P, Badge } from "../ui/index.jsx";
import { big, inr, today } from "../../utils.js";

function Sparkline({ data = [], color, height = 30, width = 72 }) {
  if (data.length < 2) return <svg width={width} height={height} />;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const lastPt = pts.split(" ").pop().split(",");
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  );
}

function KpiCard({ label, value, sub, dot, spark, onClick, active, icon, T, change }) {
  const [hov, setHov] = useState(false);
  const isPositive = change > 0;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? `${dot}08` : T.surface,
        border: `1.5px solid ${active ? dot : hov && onClick ? T.lineMid : T.line}`,
        borderRadius: 12, padding: "18px 20px 16px",
        cursor: onClick ? "pointer" : "default",
        transition: "all .18s", position: "relative", overflow: "hidden",
        transform: hov && onClick ? "translateY(-2px)" : "none",
        boxShadow: active ? `0 4px 20px ${dot}20` : hov && onClick ? T.shadowLg : T.shadowSm,
        animation: "fadeUp .3s ease both",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: dot, opacity: active ? 1 : 0.35, borderRadius: "12px 12px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: active ? dot : `${dot}20`, border: `1.5px solid ${dot}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : dot} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: active ? dot : T.ink, fontFamily: F, letterSpacing: "-1px", lineHeight: 1, marginBottom: 8 }}>{value}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Dot color={dot} size={4} />
            <span style={{ fontSize: 11, color: T.inkMuted }}>{sub}</span>
            {change !== undefined && (
              <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F_MONO, color: isPositive ? "#10b981" : change < 0 ? "#ef4444" : T.inkMuted, marginLeft: 4 }}>
                {isPositive ? "↑" : change < 0 ? "↓" : ""}
                {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        {spark && <Sparkline data={spark} color={dot} />}
      </div>
    </div>
  );
}

function LeadRow({ f, onView, T, todayV, index }) {
  const over = f.nextFollowUp && f.nextFollowUp < todayV && f.status === "Pending";
  const tod  = f.nextFollowUp === todayV && f.status === "Pending";
  return (
    <div onClick={() => onView(f)} style={{
      display: "flex", gap: 12, alignItems: "center",
      padding: "11px 16px", borderBottom: `1px solid ${T.line}`,
      cursor: "pointer", transition: "background .12s",
      animation: `fadeUp .25s ease ${index * 0.04}s both`,
    }}
      onMouseEnter={e => e.currentTarget.style.background = T.surfaceEl}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Avatar name={f.name} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{f.name}</div>
        <div style={{ fontSize: 11, color: T.inkMuted, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {f.leadSource && <SourcePill source={f.leadSource} T={T} />}
          {f.cityRegion && <span>{f.cityRegion}</span>}
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <StatusPill status={f.status} sm T={T} />
        {f.nextFollowUp && f.status === "Pending" && (
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F_MONO, color: over ? T.lost.text : tod ? T.pending.text : T.inkMuted }}>
            {over ? "⚠ Overdue" : tod ? "📅 Today" : f.nextFollowUp}
          </span>
        )}
      </div>
      {f.quoteAmount && <div style={{ fontSize: 12, fontWeight: 700, color: T.brand, fontFamily: F_MONO, flexShrink: 0, minWidth: 60, textAlign: "right" }}>{inr(f.quoteAmount)}</div>}
    </div>
  );
}

export function Dashboard({ funnels, user, onView, onAdd, statFilter, onStatClick, recentlyViewed = [], T }) {
  const todayV = today();

  const won     = funnels.filter(f => f.status === "Won");
  const pending = funnels.filter(f => f.status === "Pending");
  const total   = funnels.length;
  const wr      = total ? Math.round(won.length / total * 100) : 0;
  const revenue = won.reduce((a, f) => a + (Number(f.quoteAmount) || 0), 0);
  const pipeline= pending.reduce((a, f) => a + (Number(f.quoteAmount) || 0), 0);
  const overdue = pending.filter(f => f.nextFollowUp && f.nextFollowUp < todayV);
  const todayDue= pending.filter(f => f.nextFollowUp === todayV);

  // Recent leads
  const recent = useMemo(() =>
    [...funnels].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [funnels]);

  // Today's follow-ups
  const todayList = useMemo(() =>
    pending.filter(f => f.nextFollowUp === todayV).slice(0, 6),
    [pending, todayV]);

  // Source breakdown
  const sourceData = useMemo(() => {
    const map = {};
    funnels.forEach(f => { if (f.leadSource) map[f.leadSource] = (map[f.leadSource] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [funnels]);

  // Status donut data
  const statusData = [
    { label: "Won",     value: won.length,                              color: "#10b981" },
    { label: "Pending", value: pending.length,                          color: "#f59e0b" },
    { label: "Lost",    value: funnels.filter(f=>f.status==="Lost").length, color: "#ef4444" },
    { label: "Drop",    value: funnels.filter(f=>f.status==="Drop").length, color: "#6b7280" },
  ];

  const kpis = [
    { label: "Total Leads",  value: total,        sub: "All time",           dot: T.brand,       icon: P.list,   spark: [3,5,4,7,6,9,8,11,total], onClick: () => onStatClick(null), active: !statFilter },
    { label: "Won",          value: won.length,   sub: `${wr}% win rate`,    dot: T.won.dot,     icon: P.award,  spark: [1,2,1,3,2,4,3,5,won.length], onClick: () => onStatClick("Won"), active: statFilter==="Won" },
    { label: "Pipeline",     value: big(pipeline),sub: "Potential revenue",  dot: T.pending.dot, icon: P.bolt,   spark: [8,12,9,15,11,18,14,pipeline/1000||10], onClick: () => onStatClick("Pending"), active: statFilter==="Pending" },
    { label: "Revenue",      value: big(revenue), sub: "Closed revenue",     dot: T.won.dot,     icon: P.trend,  spark: [5,8,6,10,9,13,11,revenue/1000||8], onClick: () => onStatClick("Won"), active: false },
  ];

  return (
    <div style={{ padding: "20px 24px", fontFamily: F_BODY }}>

      {/* KPI cards */}
      <div className="ek-kpi-grid" style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} T={T} />)}
      </div>

      {/* Alert bar */}
      {(overdue.length > 0 || todayDue.length > 0) && (
        <div style={{
          background: overdue.length > 0 ? T.lost.bg : T.pending.bg,
          border: `1px solid ${overdue.length > 0 ? T.lost.dot : T.pending.dot}33`,
          borderLeft: `3px solid ${overdue.length > 0 ? T.lost.dot : T.pending.dot}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 16 }}>{overdue.length > 0 ? "⚠️" : "📅"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: overdue.length > 0 ? T.lost.text : T.pending.text }}>
              {overdue.length > 0 ? `${overdue.length} overdue follow-up${overdue.length > 1 ? "s" : ""}` : `${todayDue.length} follow-up${todayDue.length > 1 ? "s" : ""} due today`}
            </div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>Click to view pending leads requiring attention</div>
          </div>
          <button onClick={() => onStatClick("Pending")} style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: overdue.length > 0 ? T.lost.dot : T.pending.dot,
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>View now →</button>
        </div>
      )}

      {/* Main grid */}
      <div className="ek-dash-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Recent leads */}
          <div className="ek-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, letterSpacing: "-0.2px" }}>Recent Leads</div>
                <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F_MONO, marginTop: 2 }}>Latest {recent.length} entries</div>
              </div>
              {user?.role !== "Viewer" && (
              <button onClick={onAdd} style={{
                height: 30, padding: "0 12px", borderRadius: 8,
                background: T.brandSubtle, border: `1px solid ${T.brand}33`,
                color: T.brand, fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={P.plus} /></svg>
                Add Lead
              </button>
              )}
            </div>
            <div>
              {recent.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: T.inkMuted, fontSize: 13 }}>
                  No leads yet. {user?.role !== "Viewer" && <button onClick={onAdd} style={{ color: T.brand, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Add your first lead →</button>}
                </div>
              ) : recent.map((f, i) => <LeadRow key={f.id} f={f} onView={onView} T={T} todayV={todayV} index={i} />)}
            </div>
          </div>

          {/* Today's follow-ups */}
          {todayList.length > 0 && (
            <div className="ek-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.pending.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.pending.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={P.calendar} /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Today's Follow-ups</div>
                  <div style={{ fontSize: 11, color: T.inkMuted, fontFamily: F_MONO }}>{todayList.length} due today</div>
                </div>
              </div>
              <div>
                {todayList.map((f, i) => <LeadRow key={f.id} f={f} onView={onView} T={T} todayV={todayV} index={i} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status breakdown */}
          <div className="ek-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Pipeline Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusData.map(({ label, value, color }) => {
                const pct = total ? Math.round(value / total * 100) : 0;
                return (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Dot color={color} size={7} />
                        <span style={{ fontSize: 12, color: T.ink, fontWeight: 500 }}>{label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, fontFamily: F_MONO }}>{value}</span>
                        <span style={{ fontSize: 10, color: T.inkMuted, fontFamily: F_MONO, width: 28, textAlign: "right" }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: T.surfaceEl, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width .6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead sources */}
          <div className="ek-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Lead Sources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {sourceData.length === 0 ? (
                <div style={{ fontSize: 12, color: T.inkMuted, textAlign: "center", padding: "12px 0" }}>No data yet</div>
              ) : sourceData.map(([src, cnt], i) => {
                const pct = total ? Math.round(cnt / total * 100) : 0;
                return (
                  <div key={src} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, flexShrink: 0, textAlign: "center", fontSize: 11, fontWeight: 700, color: T.inkMuted, fontFamily: F_MONO }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: T.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{src}</span>
                        <span style={{ fontSize: 11, fontFamily: F_MONO, color: T.inkMuted, flexShrink: 0, marginLeft: 6 }}>{cnt}</span>
                      </div>
                      <div style={{ height: 4, background: T.surfaceEl, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: T.brand, borderRadius: 3, opacity: 0.7 + (0.3 * (sourceData.length - i) / sourceData.length) }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <div className="ek-card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Recently Viewed</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentlyViewed.slice(0, 4).map((f, i) => (
                  <div key={f.id} onClick={() => onView(f)} style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    padding: "6px 8px", borderRadius: 8, transition: "background .12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceEl}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Avatar name={f.name} size={26} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      <div style={{ fontSize: 10, color: T.inkMuted, fontFamily: F_MONO }}>{f.status}</div>
                    </div>
                    {f.quoteAmount && <span style={{ fontSize: 11, fontWeight: 700, color: T.brand, fontFamily: F_MONO }}>{inr(f.quoteAmount)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
