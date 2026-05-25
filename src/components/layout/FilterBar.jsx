import React, { useState, useEffect, useRef, useCallback } from "react";
import { F_BODY, F_MONO, F_SERIF, F } from "../../theme/index.js";
import { Ic, P, Dot, Btn, FInput, FSelect, Avatar, StatusPill, SourcePill, SkeletonRow, SL, inputSx, selectBg, mkFocus, mkBlur } from "../ui/index.jsx";
import { FULL, VIEWER, can, CATS, ENQS, FTYPES, ROLES, STATUS, LEAD_SOURCES, OUTCOMES } from "../../constants.js";
import { today, stamp, inr, big } from "../../utils.js";

export function FilterBar({fil,setF,reset,users=[],user,T,funnels=[]}) {
  const [showMore,setShowMore]=useState(false);

  const sel=(val,key,opts,ph)=>(
    <select value={val} onChange={e=>setF(key,e.target.value)}
      style={{padding:"4px 22px 4px 9px",border:`1px solid ${val?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,letterSpacing:"0.06em",color:val?T.ink:T.inkMuted,background:val?`${T.brandSubtle} ${selectBg}`:`${T.surface} ${selectBg}`,cursor:"pointer",outline:"none",appearance:"none",fontWeight:val?500:400,textTransform:"uppercase"}}>
      <option value="">{ph}</option>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  );
  const chk=(key,label)=>(
    <label style={{display:"flex",alignItems:"center",gap:5,fontFamily:F_MONO,fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:fil[key]?T.brand:T.inkMuted,cursor:"pointer",fontWeight:fil[key]?500:400,userSelect:"none"}}>
      <input type="checkbox" checked={fil[key]} onChange={e=>setF(key,e.target.checked)} style={{accentColor:T.brand,width:12,height:12}}/>
      {label}
    </label>
  );
  const dateInp=(key,ph)=>(
    <input type="date" value={fil[key]} onChange={e=>setF(key,e.target.value)}
      style={{padding:"4px 8px",border:`1px solid ${fil[key]?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,color:fil[key]?T.ink:T.inkMuted,background:fil[key]?T.brandSubtle:T.surface,outline:"none",cursor:"pointer",width:120}}
      title={ph}/>
  );
  const numInp=(key,ph)=>(
    <input type="number" value={fil[key]} onChange={e=>setF(key,e.target.value)} placeholder={ph}
      style={{padding:"4px 8px",border:`1px solid ${fil[key]?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,color:T.ink,background:fil[key]?T.brandSubtle:T.surface,outline:"none",width:80}}/>
  );

  const cities=[...new Set(funnels.map(f=>f.cityRegion).filter(Boolean))].sort();
  const assignees=[...new Set(funnels.map(f=>f.assignedTo).filter(Boolean))].sort();
  const anyExtra=fil.assignedTo||fil.city||fil.category||fil.dateFrom||fil.dateTo||fil.followFrom||fil.followTo||fil.minAmt||fil.maxAmt||fil.hasOrder||fil.hasQuote||fil.overdue||fil.wonMonth;
  const anyBasic=fil.status||fil.funnelType||fil.enquiryType||fil.leadSource||fil.descFilter||fil.missed||fil.todayF||fil.upcoming||fil.cre;
  const any=anyBasic||anyExtra;

  const Div=()=><div style={{width:1,height:12,background:T.line,flexShrink:0}}/>;
  const Label=({t})=><span style={{fontFamily:F_MONO,fontSize:9,fontWeight:400,color:T.inkMuted,letterSpacing:"0.12em",textTransform:"uppercase",flexShrink:0}}>{t}</span>;

  return (
    <div style={{borderBottom:`1px solid ${T.line}`,background:T.surface}}>
      <div className="ek-filter-scroll" style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <Ic d={P.filter} sz={13} color={T.ink}/>
          <span style={{fontFamily:F_MONO,fontSize:9,color:T.inkSub,letterSpacing:"0.12em",textTransform:"uppercase"}}>Filter</span>
        </div>
        <Div/>
        {chk("missed","Missed")}
        {chk("todayF","Today")}
        {chk("upcoming","Upcoming")}
        {chk("overdue","Overdue")}
        {chk("wonMonth","Won this month")}
        <Div/>
        {sel(fil.status,"status",STATUS,"Status")}
        {sel(fil.funnelType,"funnelType",FTYPES,"Type")}
        {sel(fil.enquiryType,"enquiryType",ENQS,"Enquiry")}
        {sel(fil.leadSource,"leadSource",LEAD_SOURCES,"Source")}
        {FULL.includes(user?.role)&&users.filter(u=>u.role==="CRE").length>0&&(
          <select value={fil.cre||""} onChange={e=>setF("cre",e.target.value)}
            style={{padding:"4px 22px 4px 9px",border:`1px solid ${fil.cre?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,letterSpacing:"0.06em",textTransform:"uppercase",color:fil.cre?T.ink:T.inkMuted,background:fil.cre?`${T.brandSubtle} ${selectBg}`:`${T.surface} ${selectBg}`,cursor:"pointer",outline:"none",appearance:"none",fontWeight:fil.cre?500:400}}>
            <option value="">CRE</option>
            {users.filter(u=>u.role==="CRE").map(u=><option key={u.name} value={u.name}>{u.name}</option>)}
          </select>
        )}
        <Div/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:T.surfaceEl,border:`1px solid ${T.line}`,borderRadius:T.r.sm,padding:"3px 9px",minWidth:140,flex:1,maxWidth:200}}>
          <Ic d={P.search} sz={13} color={T.ink}/>
          <input value={fil.descFilter} onChange={e=>setF("descFilter",e.target.value)} placeholder="Search description…"
            style={{border:"none",background:"transparent",outline:"none",fontSize:11,fontFamily:F_BODY,color:T.ink,width:"100%"}}/>
          {fil.descFilter&&<button onClick={()=>setF("descFilter","")} style={{background:"none",border:"none",cursor:"pointer",color:T.inkMuted,display:"flex",padding:0}}><Ic d={P.close} sz={10} color="currentColor"/></button>}
        </div>
        <button onClick={()=>setShowMore(x=>!x)}
          style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:T.r.sm,border:`1px solid ${showMore||anyExtra?T.brand:T.line}`,background:showMore||anyExtra?T.brandSubtle:"transparent",color:showMore||anyExtra?T.brand:T.inkMuted,fontFamily:F_MONO,fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:500,cursor:"pointer",flexShrink:0,transition:"all .15s"}}>
          <Ic d={P.filter} sz={12} color={showMore||anyExtra?T.brand:T.ink}/>
          More {anyExtra&&<span style={{background:T.brand,color:T.inkInvert,borderRadius:2,fontSize:9,fontWeight:700,padding:"0 4px",marginLeft:2}}>●</span>}
        </button>
        {any&&<button onClick={reset} style={{fontFamily:F_MONO,fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:T.brand,background:"none",border:"none",cursor:"pointer",fontWeight:500,padding:"0 4px",textDecoration:"underline",flexShrink:0}}>Clear all</button>}
      </div>

      {showMore&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 16px 10px",flexWrap:"wrap",borderTop:`1px solid ${T.line}`,background:T.surfaceEl,overflowX:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Assigned"/>
            <select value={fil.assignedTo} onChange={e=>setF("assignedTo",e.target.value)}
              style={{padding:"4px 22px 4px 9px",border:`1px solid ${fil.assignedTo?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,textTransform:"uppercase",letterSpacing:"0.06em",color:fil.assignedTo?T.ink:T.inkMuted,background:fil.assignedTo?`${T.brandSubtle} ${selectBg}`:`${T.surface} ${selectBg}`,cursor:"pointer",outline:"none",appearance:"none"}}>
              <option value="">Anyone</option>
              {assignees.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="City"/>
            {cities.length>0?(
              <select value={fil.city} onChange={e=>setF("city",e.target.value)}
                style={{padding:"4px 22px 4px 9px",border:`1px solid ${fil.city?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,textTransform:"uppercase",letterSpacing:"0.06em",color:fil.city?T.ink:T.inkMuted,background:fil.city?`${T.brandSubtle} ${selectBg}`:`${T.surface} ${selectBg}`,cursor:"pointer",outline:"none",appearance:"none"}}>
                <option value="">All cities</option>
                {cities.map(c=><option key={c}>{c}</option>)}
              </select>
            ):(
              <input value={fil.city} onChange={e=>setF("city",e.target.value)} placeholder="City…"
                style={{padding:"4px 8px",border:`1px solid ${fil.city?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,color:T.ink,background:fil.city?T.brandSubtle:T.surface,outline:"none",width:110}}/>
            )}
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Category"/>
            {sel(fil.category,"category",CATS,"All categories")}
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Created"/>
            {dateInp("dateFrom","From")}
            <span style={{fontFamily:F_MONO,fontSize:10,color:T.inkMuted}}>→</span>
            {dateInp("dateTo","To")}
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Follow-up"/>
            {dateInp("followFrom","From")}
            <span style={{fontFamily:F_MONO,fontSize:10,color:T.inkMuted}}>→</span>
            {dateInp("followTo","To")}
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Quote ₹"/>
            {numInp("minAmt","Min")}
            <span style={{fontFamily:F_MONO,fontSize:10,color:T.inkMuted}}>→</span>
            {numInp("maxAmt","Max")}
          </div>
          <Div/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Label t="Order"/>
            <select value={fil.hasOrder} onChange={e=>setF("hasOrder",e.target.value)}
              style={{padding:"4px 22px 4px 9px",border:`1px solid ${fil.hasOrder?T.brand:T.line}`,borderRadius:T.r.sm,fontSize:11,fontFamily:F_MONO,color:fil.hasOrder?T.ink:T.inkMuted,background:fil.hasOrder?`${T.brandSubtle} ${selectBg}`:`${T.surface} ${selectBg}`,cursor:"pointer",outline:"none",appearance:"none"}}>
              <option value="">Any</option>
              <option value="yes">Has order</option>
              <option value="no">No order</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
