import React, { useState, useEffect, useRef } from "react";
import { F_BODY, F_MONO, F } from "../../theme/index.js";
import { Ic, P, Avatar, Badge } from "../ui/index.jsx";
import { OnlineAvatarCluster } from "./PresencePanel.jsx";
import { can } from "../../constants.js";
import { today } from "../../utils.js";

export function Topbar({ title, search, setSearch, user, onAdd, onExportAll, onExportFiltered, fLen, aLen, onMenuToggle, T, todayCount, dateFilter, setDateFilter, dateType, setDateType, todayFunnels = [], notifCount = 0, onNotifClick, onImportCSV, onlineUsers = [] }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const h = e => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="ek-topbar">
      {/* Mobile menu */}
      <button onClick={onMenuToggle} className="ek-mobile-menu ek-show-mobile"
        style={{ background: "none", border: "none", cursor: "pointer", color: T.inkSub, padding: 4, flexShrink: 0, display: "none", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
        <Ic d={P.menu} sz={20} color={T.inkSub} sw={2} />
      </button>

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>{title}</h1>
        <div className="ek-topbar-sub" style={{ fontSize: 11, fontFamily: F_MONO, color: T.inkMuted, letterSpacing: "0.02em", lineHeight: 1.2 }}>
          {dayName} · {dateStr}
        </div>
      </div>

      {/* Search */}
      <div className="ek-topbar-search" style={{
        display: "flex", alignItems: "center", gap: 8,
        background: T.surfaceEl, border: `1.5px solid ${T.line}`,
        borderRadius: 9, padding: "0 12px", height: 36,
        minWidth: 180, maxWidth: 280, flex: 1, marginLeft: 8,
        transition: "border-color .15s, box-shadow .15s",
      }}
        onFocus={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${T.brandRgb},0.12)`; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.boxShadow = "none"; }}>
        <Ic d={P.search} sz={14} color={T.inkMuted} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search leads…"
          style={{ border: "none", outline: "none", background: "transparent", color: T.ink, fontSize: 13, fontFamily: F_BODY, width: "100%" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, padding: 0, display: "flex" }}>
            <Ic d={P.close} sz={12} color={T.inkMuted} />
          </button>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Count badge */}
      <div className="ek-hide-mobile" style={{ fontSize: 12, color: T.inkMuted, fontFamily: F_MONO, padding: "4px 10px", background: T.surfaceEl, borderRadius: 6, border: `1px solid ${T.line}`, whiteSpace: "nowrap" }}>
        {fLen} / {aLen} leads
      </div>

      {/* Add button */}
      {can(user, "create") && (
        <button onClick={onAdd} style={{
          height: 36, padding: "0 16px", borderRadius: 9,
          background: T.brand, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: F_BODY,
          transition: "background .14s", flexShrink: 0, boxShadow: `0 2px 8px ${T.brand}44`,
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.brandHover}
          onMouseLeave={e => e.currentTarget.style.background = T.brand}>
          <Ic d={P.plus} sz={14} color="#fff" sw={2.5} />
          <span className="ek-hide-mobile" style={{ display: "flex" }}>New Lead</span>
        </button>
      )}

      {/* Online users cluster */}
      {onlineUsers.length > 0 && (
        <div className="ek-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: T.surfaceEl, borderRadius: 20, border: `1px solid ${T.line}` }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 2s ease infinite" }} />
          <OnlineAvatarCluster users={onlineUsers} T={T} />
          <span style={{ fontSize: 11, fontFamily: "JetBrains Mono,monospace", color: T.inkMuted, letterSpacing: "0.04em" }}>
            {onlineUsers.length} online
          </span>
        </div>
      )}

      {/* Notifications */}
      <button onClick={onNotifClick} title="Notifications" style={{
        position: "relative", width: 36, height: 36, borderRadius: 9,
        background: "transparent", border: `1px solid ${T.line}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .14s", flexShrink: 0,
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.surfaceEl}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Ic d={P.bell} sz={16} color={T.inkSub} />
        {notifCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8,
            background: "#ef4444", color: "#fff",
            fontSize: 9, fontWeight: 700, fontFamily: F_MONO,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${T.surface}`, padding: "0 3px",
          }}>{notifCount > 99 ? "99+" : notifCount}</span>
        )}
      </button>

      {/* More menu */}
      <div ref={moreRef} style={{ position: "relative" }}>
        <button onClick={() => setMoreOpen(x => !x)} title="More options" style={{
          width: 36, height: 36, borderRadius: 9,
          background: moreOpen ? T.brandSubtle : "transparent",
          border: `1px solid ${moreOpen ? T.brand : T.line}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .14s", flexShrink: 0,
        }}
          onMouseEnter={e => { if (!moreOpen) e.currentTarget.style.background = T.surfaceEl; }}
          onMouseLeave={e => { if (!moreOpen) e.currentTarget.style.background = "transparent"; }}>
          <Ic d={P.more} sz={16} color={moreOpen ? T.brand : T.inkSub} />
        </button>
        {moreOpen && (
          <div className="ek-dropdown" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 200, zIndex: 100 }}>
            <div style={{ padding: "6px 0" }}>
              {can(user, "export") && <>
                <div className="ek-dropdown-item" onClick={() => { onExportAll(); setMoreOpen(false); }}>
                  <Ic d={P.dl} sz={14} color={T.inkMuted} />
                  <span style={{ fontSize: 13, color: T.ink }}>Export all ({aLen})</span>
                </div>
                <div className="ek-dropdown-item" onClick={() => { onExportFiltered(); setMoreOpen(false); }}>
                  <Ic d={P.filter} sz={14} color={T.inkMuted} />
                  <span style={{ fontSize: 13, color: T.ink }}>Export filtered ({fLen})</span>
                </div>
              </>}
              {can(user, "create") && (
                <div className="ek-dropdown-item" onClick={() => { onImportCSV && onImportCSV(); setMoreOpen(false); }}>
                  <Ic d={P.up} sz={14} color={T.inkMuted} />
                  <span style={{ fontSize: 13, color: T.ink }}>Import CSV</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
