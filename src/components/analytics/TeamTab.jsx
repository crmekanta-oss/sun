import React from "react";
import { F } from "../../theme/index.js";
import { Avatar } from "../ui/index.jsx";
import { big } from "../../utils.js";
import { CardT, DeltaBadge } from "./AnalyticsHelpers.jsx";

export function TeamTab({ teamArr, cmpTeamMap, compareOn, T }) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <CardT title="Team Leaderboard" subtitle="Ranked by total leads handled" T={T}>
        {teamArr.length === 0 ? (
          <div style={{ fontSize:12, color:T.inkMuted, fontFamily:F }}>No team data yet.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {teamArr.map(([name, d], idx) => {
              const wr = d.total ? Math.round(d.won/d.total*100) : 0;
              const cd = cmpTeamMap[name] || { total:0, won:0, revenue:0 };
              return (
                <div key={name} style={{ background:T.surfaceEl, border:`1px solid ${T.line}`, borderRadius:T.r.lg, padding:"16px 18px", display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ fontSize:20, flexShrink:0 }}>{medals[idx] || `#${idx+1}`}</div>
                  <Avatar name={name} size={40} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.ink, fontFamily:F, marginBottom:4 }}>{name}</div>
                    <div style={{ height:5, background:T.line, borderRadius:3, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ width:`${wr}%`, height:"100%", background:T.won.dot, borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, color:T.inkMuted, fontFamily:F }}>{wr}% win rate · {d.won} won of {d.total}</div>
                  </div>
                  <div style={{ display:"flex", gap:20, flexShrink:0 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:"#5B3BE8", fontFamily:F }}>{d.total}</div>
                      <div style={{ fontSize:10, color:T.inkMuted, fontFamily:F }}>Total</div>
                      {compareOn && cd.total > 0 && <DeltaBadge cur={d.total} prev={cd.total} T={T} />}
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:T.won.dot, fontFamily:F }}>{d.won}</div>
                      <div style={{ fontSize:10, color:T.inkMuted, fontFamily:F }}>Won</div>
                      {compareOn && cd.won > 0 && <DeltaBadge cur={d.won} prev={cd.won} T={T} />}
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:T.pending.dot, fontFamily:F }}>{d.pending}</div>
                      <div style={{ fontSize:10, color:T.inkMuted, fontFamily:F }}>Pending</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:"#5B3BE8", fontFamily:F }}>{big(d.revenue)}</div>
                      <div style={{ fontSize:10, color:T.inkMuted, fontFamily:F }}>Revenue</div>
                      {compareOn && cd.revenue > 0 && <DeltaBadge cur={d.revenue} prev={cd.revenue} T={T} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardT>

      <CardT title="Team Win vs Loss — Visual" noPad T={T}>
        <div style={{ padding:"16px 20px" }}>
          {teamArr.length === 0 ? (
            <div style={{ fontSize:12, color:T.inkMuted, fontFamily:F }}>No data.</div>
          ) : (() => {
            const maxTotal = Math.max(...teamArr.map(([,d]) => d.total), 1);
            return teamArr.map(([name, d]) => (
              <div key={name} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:T.ink, fontFamily:F, fontWeight:500 }}>{name}</span>
                  <span style={{ fontSize:11, color:T.inkMuted, fontFamily:F }}>{d.total} leads</span>
                </div>
                <div style={{ height:10, background:T.surfaceEl, borderRadius:5, overflow:"hidden", display:"flex" }}>
                  <div style={{ width:`${(d.won/maxTotal)*100}%`,     background:T.won.dot,     transition:"width .6s" }} />
                  <div style={{ width:`${(d.pending/maxTotal)*100}%`, background:T.pending.dot, transition:"width .6s" }} />
                  <div style={{ width:`${(d.lost/maxTotal)*100}%`,    background:T.lost.dot,    transition:"width .6s" }} />
                  <div style={{ width:`${(d.drop/maxTotal)*100}%`,    background:T.drop.dot,    transition:"width .6s" }} />
                </div>
                <div style={{ display:"flex", gap:12, marginTop:4 }}>
                  {[["Won",d.won,T.won.dot],["Pending",d.pending,T.pending.dot],["Lost",d.lost,T.lost.dot],["Drop",d.drop,T.drop.dot]].map(([l,n,c]) => n > 0 && (
                    <span key={l} style={{ fontSize:10, color:c, fontFamily:F, fontWeight:600 }}>{l}: {n}</span>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      </CardT>
    </>
  );
}
