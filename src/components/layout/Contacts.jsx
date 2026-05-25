import React, { useMemo, useState } from "react";
import { F, F_MONO } from "../../theme/index.js";
import { Avatar, StatusPill, Dot, Ic, P, Btn } from "../ui/index.jsx";
import { inr, big, xls } from "../../utils.js";

export function Contacts({ funnels, onView, T }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const contacts = useMemo(() => {
    const map = {};
    funnels.forEach(f => {
      const key = (f.phone || "").replace(/\s/g, "") || `nophone_${f.id}`;
      if (!map[key]) {
        map[key] = { id: key, name: f.name, phone: f.phone, email: f.email, city: f.cityRegion, deals: [], totalRevenue: 0, wonCount: 0, lastContact: f.createdAt };
      }
      map[key].deals.push(f);
      if (f.quoteAmount) map[key].totalRevenue += Number(f.quoteAmount);
      if (f.status === "Won") map[key].wonCount++;
      if (f.createdAt > map[key].lastContact) map[key].lastContact = f.createdAt;
    });
    return Object.values(map).sort((a, b) => b.deals.length - a.deals.length);
  }, [funnels]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      (c.name||"").toLowerCase().includes(q) || (c.phone||"").includes(q) ||
      (c.email||"").toLowerCase().includes(q) || (c.city||"").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const sel = selected ? contacts.find(c => c.id === selected) : null;

  const exportContacts = () => {
    const rows = filtered.flatMap(c => c.deals.map(d => ({ ...d, _contactDeals: c.deals.length })));
    xls(rows, `Suntronix_Contacts_${new Date().toISOString().split("T")[0]}.xls`);
  };

  const exportContact = (c) => {
    xls(c.deals, `Suntronix_${c.name.replace(/\s/g,"_")}.xls`);
  };

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: F }}>
      {/* Left: contact list */}
      <div style={{ width: sel ? "40%" : "100%", borderRight: sel ? `1px solid ${T.line}` : "none", display: "flex", flexDirection: "column", transition: "width .2s" }}>
        {/* Search header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.line}`, background: T.surface, position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Contacts</div>
              <div style={{ fontSize: 12, color: T.inkMuted }}>{contacts.length} unique customers</div>
            </div>
            <button onClick={exportContacts}
              style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:`1px solid ${T.line}`,background:T.surface,color:T.inkSub,fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:500 }}
              title="Export all contacts to Excel">
              ⬇ Export All
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Ic d={P.search} sz={13} color={T.inkMuted} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, phone, email, city…"
              style={{ width: "100%", padding: "8px 11px 8px 30px", border: `1px solid ${T.lineMid}`, borderRadius: 6, fontSize: 13, fontFamily: F, color: T.ink, background: T.surfaceEl, outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Ic d={P.search} sz={13} color={T.inkMuted} />
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(c => {
            const latestStatus = c.deals.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0]?.status;
            return (
              <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)}
                style={{ padding: "12px 16px", borderBottom: `1px solid ${T.line}`, cursor: "pointer", background: selected === c.id ? T.brandSubtle : T.surface, display: "flex", gap: 12, alignItems: "flex-start", transition: "background .12s" }}
                onMouseEnter={e => { if (selected !== c.id) e.currentTarget.style.background = T.surfaceEl; }}
                onMouseLeave={e => { if (selected !== c.id) e.currentTarget.style.background = T.surface; }}>
                <Avatar name={c.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 2 }}>{c.phone} {c.city ? `· ${c.city}` : ""}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, background: T.surfaceEl, color: "#5B3BE8", padding: "1px 7px", borderRadius: 8, fontWeight: 600, border: `1px solid ${T.line}` }}>
                      {c.deals.length} deal{c.deals.length !== 1 ? "s" : ""}
                    </span>
                    {c.wonCount > 0 && (
                      <span style={{ fontSize: 10, background: T.won.bg, color: T.won.text, padding: "1px 7px", borderRadius: 8, fontWeight: 600 }}>
                        ✓ {c.wonCount} won
                      </span>
                    )}
                    {c.totalRevenue > 0 && (
                      <span style={{ fontSize: 10, color: T.inkMuted, fontFamily: F_MONO }}>{big(c.totalRevenue)}</span>
                    )}
                  </div>
                </div>
                {c.deals.length > 1 && (
                  <span style={{ fontSize: 10, background: T.pending.bg, color: T.pending.text, padding: "2px 7px", borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
                    REPEAT
                  </span>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: T.inkMuted, fontSize: 13 }}>
              No contacts found for "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Right: contact detail */}
      {sel && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: T.bg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Avatar name={sel.name} size={52} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{sel.name}</div>
                <div style={{ fontSize: 13, color: T.inkMuted, marginTop: 3 }}>{sel.phone} {sel.email ? `· ${sel.email}` : ""}</div>
                {sel.city && <div style={{ fontSize: 12, color: T.inkMuted }}>{sel.city}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => exportContact(sel)}
                style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:`1px solid ${T.line}`,background:T.surface,color:T.inkSub,fontSize:12,fontFamily:F,cursor:"pointer" }}>
                ⬇ Export
              </button>
              <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.line}`, background: T.surfaceEl, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic d={P.close} sz={12} color={T.inkSub} />
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total Deals", value: sel.deals.length, color: "#5B3BE8" },
              { label: "Won Deals",   value: sel.wonCount,     color: T.won.dot },
              { label: "Total Value", value: big(sel.totalRevenue), color: "#5B3BE8" },
            ].map(s => (
              <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: F }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.inkMuted, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Deal history */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Deal History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sel.deals.sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).map(deal => (
              <div key={deal.id} onClick={() => { onView(deal); setSelected(null); }}
                style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceEl}
                onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{deal.enquiryType || "Enquiry"}</div>
                  <StatusPill status={deal.status} sm T={T} />
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: T.inkMuted }}>
                  {deal.quoteAmount && <span style={{ color: "#5B3BE8", fontWeight: 600 }}>{inr(deal.quoteAmount)}</span>}
                  {deal.createdAt && <span>{new Date(deal.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>}
                  {deal.assignedTo && <span>→ {deal.assignedTo}</span>}
                </div>
                {deal.remarks && <div style={{ fontSize: 12, color: T.inkSub, marginTop: 5, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deal.remarks}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
