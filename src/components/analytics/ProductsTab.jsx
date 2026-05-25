import React from "react";
import { F } from "../../theme/index.js";
import { CATS } from "../../constants.js";
import { big } from "../../utils.js";
import { CardT, HBar } from "./AnalyticsHelpers.jsx";

export function ProductsTab({ curr, T }) {
  const catRevMap = {};
  curr.forEach(f => (f.products || []).forEach(p => {
    if (p.category) catRevMap[p.category] = (catRevMap[p.category] || 0) + (Number(p.qty) * Number(p.price) || 0);
  }));
  const catRevArr  = Object.entries(catRevMap).sort((a,b) => b[1]-a[1]);
  const maxCatRev  = Math.max(...catRevArr.map(x=>x[1]), 1);

  const unitsByCat = CATS.map(c => ({ c, n: curr.flatMap(f=>f.products||[]).filter(p=>p.category===c).reduce((a,p)=>a+(Number(p.qty)||0),0) })).sort((a,b)=>b.n-a.n);
  const maxUnits   = Math.max(...unitsByCat.map(x=>x.n), 1);

  return (
    <>
      <div className="ek-analytics-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <CardT title="Revenue by Product Category" T={T}>
          {catRevArr.length === 0 ? <div style={{ fontSize:12, color:T.inkMuted, fontFamily:F }}>No product data.</div> :
            catRevArr.map(([cat,rev]) => <HBar key={cat} label={cat} val={rev} max={maxCatRev} color="#5B3BE8" sub={big(rev)} T={T} />)
          }
        </CardT>

        <CardT title="Units Ordered by Category" T={T}>
          {unitsByCat.every(x=>x.n===0) ? <div style={{ fontSize:12, color:T.inkMuted, fontFamily:F }}>No unit data.</div> :
            unitsByCat.filter(x=>x.n>0).map(({c,n}) => <HBar key={c} label={c} val={n} max={maxUnits} color={T.premium.dot} sub={`${n} units`} T={T} />)
          }
        </CardT>
      </div>

      {/* Bar Chart SVG */}
      <CardT title="Category Revenue — Bar Chart" noPad T={T}>
        <div style={{ overflowX:"auto", padding:"16px 20px" }}>
          {catRevArr.length === 0 ? (
            <div style={{ fontSize:12, color:T.inkMuted, fontFamily:F }}>No data.</div>
          ) : (() => {
            const bH=200, bW=560, bPad={l:50,r:16,t:16,b:56};
            const bInnerW=bW-bPad.l-bPad.r, bInnerH=bH-bPad.t-bPad.b;
            const data    = catRevArr.slice(0,10);
            const maxRev  = Math.max(...data.map(x=>x[1]), 1);
            const bW2     = bInnerW / data.length;
            return (
              <svg width="100%" viewBox={`0 0 ${bW} ${bH}`} style={{ display:"block", minWidth:300 }}>
                {[0,0.25,0.5,0.75,1].map(r => (
                  <g key={r}>
                    <line x1={bPad.l} y1={bPad.t+bInnerH*(1-r)} x2={bPad.l+bInnerW} y2={bPad.t+bInnerH*(1-r)} stroke={T.line} strokeWidth="1"/>
                    <text x={bPad.l-4} y={bPad.t+bInnerH*(1-r)+4} textAnchor="end" fontSize="9" fill={T.inkMuted} fontFamily={F}>{big(maxRev*r)}</text>
                  </g>
                ))}
                {data.map(([cat,rev], i) => {
                  const barH = (rev/maxRev)*bInnerH;
                  const bX   = bPad.l + i*bW2 + bW2*0.1;
                  const bW3  = bW2*0.8;
                  return (
                    <g key={cat}>
                      <rect x={bX} y={bPad.t+bInnerH-barH} width={bW3} height={barH} rx="3" fill="#5B3BE8" fillOpacity="0.8"/>
                      <text x={bX+bW3/2} y={bH-bPad.b+14} textAnchor="middle" fontSize="8" fill={T.inkMuted} fontFamily={F} transform={`rotate(-30, ${bX+bW3/2}, ${bH-bPad.b+14})`}>{cat.length>8?cat.slice(0,8)+"…":cat}</text>
                      {barH>16 && <text x={bX+bW3/2} y={bPad.t+bInnerH-barH-4} textAnchor="middle" fontSize="8" fill={T.inkSub} fontFamily={F}>{big(rev)}</text>}
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>
      </CardT>

      {/* Summary stats */}
      <div className="ek-analytics-pipeline" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
        {[
          { label:"Total Product Units",  value:curr.flatMap(f=>f.products||[]).reduce((a,p)=>a+(Number(p.qty)||0),0), color:"#5B3BE8" },
          { label:"Total Units Quoted",   value:curr.reduce((a,f)=>a+(Number(f.quoteQty)||0),0), color:T.pending.dot },
          { label:"With Order Number",    value:curr.filter(f=>f.orderNumber).length,              color:T.won.dot },
          { label:"Unique Categories",    value:Object.keys(catRevMap).length,                     color:T.premium.dot },
        ].map(s => (
          <div key={s.label} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:T.r.lg, padding:"16px 18px", boxShadow:T.shadowSm }}>
            <div style={{ fontSize:24, fontWeight:700, color:s.color, fontFamily:F, letterSpacing:"-0.5px" }}>{s.value}</div>
            <div style={{ fontSize:11, color:T.inkMuted, fontFamily:F, marginTop:5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
