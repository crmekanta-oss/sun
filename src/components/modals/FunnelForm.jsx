import React, { useState, useEffect, useRef } from "react";
import { F_BODY, F_MONO, F_SERIF, F } from "../../theme/index.js";
import { Ic, P, Dot, Btn, FInput, FSelect, Avatar, StatusPill, SourcePill, SL, inputSx, selectBg, mkFocus, mkBlur } from "../ui/index.jsx";
import { FULL, VIEWER, can, DEFAULT_CATS, ENQS, FTYPES, STATUS, OUTCOMES, LEAD_SOURCES } from "../../constants.js";
import { today, stamp, inr } from "../../utils.js";

export function FunnelForm({onClose,onSave,existing,user,users=[],T}) {
  const DRAFT_KEY = `ek-draft-${user?.username||"user"}`;
  const blank={name:"",phone:"",email:"",enquiryType:"",funnelType:"",leadSource:"",cityRegion:"",nextFollowUp:"",products:[{desc:"",category:"",qty:"",price:""}],remarks:"",deliveryDetails:"",paymentTerms:"",orderNumber:"",quoteQty:"",quoteAmount:"",quoteDesc:"",status:"Pending",assignedTo:"",lostDropReason:"",isExisting:false};

  // ── Categories (persisted) ──
  const CATS_KEY = "suntronix_cats";
  const loadCats = () => { try { const s = localStorage.getItem(CATS_KEY); return s ? JSON.parse(s) : DEFAULT_CATS; } catch { return DEFAULT_CATS; } };
  const [cats, setCats] = useState(loadCats);
  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const addCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed || cats.includes(trimmed)) return;
    const updated = [...cats, trimmed];
    setCats(updated);
    try { localStorage.setItem(CATS_KEY, JSON.stringify(updated)); } catch {}
    setNewCat("");
    setShowAddCat(false);
  };

  // ── Draft logic ──
  const loadDraft = () => { try { const d = localStorage.getItem(DRAFT_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };
  const saveDraft = (data) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {} };
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

  const draft = !existing ? loadDraft() : null;
  const [showDraftBanner, setShowDraftBanner] = useState(!!draft);
  const [form,setForm]=useState(existing?{...blank,...existing,products:existing.products?.length?existing.products:blank.products}:blank);
  const [errs,setErrs]=useState({});

  // Auto-save draft on every form change (only for new funnels)
  useEffect(() => {
    if (existing) return;
    const hasData = form.name || form.phone || form.email || form.remarks ||
      (form.products||[]).some(p=>p.desc);
    if (hasData) saveDraft(form);
  }, [form, existing]);

  const restoreDraft = () => {
    if (draft) { setForm({...blank,...draft,products:draft.products?.length?draft.products:blank.products}); }
    setShowDraftBanner(false);
  };
  const discardDraft = () => { clearDraft(); setShowDraftBanner(false); };

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const sp=(i,k,v)=>{const p=[...form.products];p[i]={...p[i],[k]:v};set("products",p);};
  const isWon=form.status==="Won";
  const inpSx=(err)=>({...inputSx(T,err)});
  const fo=mkFocus(T); const bl=mkBlur(T);

  const val=()=>{
    const e={};
    if(!form.name) e.name="Required";
    if(!form.phone) e.phone="Required";
    else if(!/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone.trim())) e.phone="Enter a valid phone number";
    if(!form.enquiryType) e.enquiryType="Required";
    if(!form.funnelType) e.funnelType="Required";
    if(!form.leadSource) e.leadSource="Required";
    if(!form.nextFollowUp&&form.status!=="Won") e.nfu="Required";
    if(!form.remarks) e.remarks="Required";
    if(!form.deliveryDetails) e.deliveryDetails="Required";
    if(!form.quoteDesc) e.quoteDesc="Required";
    if(!form.quoteQty) e.quoteQty="Required";
    else if(Number(form.quoteQty)<=0) e.quoteQty="Must be greater than 0";
    if(!form.quoteAmount) e.quoteAmount="Required";
    else if(Number(form.quoteAmount)<=0) e.quoteAmount="Must be greater than 0";
    if(!form.products.some(p=>p.desc.trim()!=="")) e.products="At least one product item is required";
    if(!user?.name) e.auth="You must be logged in";
    setErrs(e); return !Object.keys(e).length;
  };
  const submit=()=>{ if(val()){ clearDraft(); onSave(form); } };
  const handleClose=()=>{ onClose(); };
  const prodTotal=(form.products||[]).reduce((a,p)=>a+(Number(p.qty)*Number(p.price)||0),0);
  const creUsers=users.filter(u=>u.role==="CRE");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:9100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{background:T.surface,borderRadius:T.r["2xl"],width:"100%",maxWidth:"min(720px,100vw)",maxHeight:"95vh",overflowY:"auto",boxShadow:T.shadowXl,animation:"fadeUp .2s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:`1px solid ${T.line}`,position:"sticky",top:0,background:T.surface,zIndex:1,borderRadius:`${T.r["2xl"]} ${T.r["2xl"]} 0 0`}}>
          <div>
            <h2 style={{fontSize:16,fontWeight:700,color:T.ink,fontFamily:F,margin:"0 0 2px"}}>{existing?"Edit funnel":"New funnel"}</h2>
            <p style={{margin:0,fontSize:12,color:T.inkSub,fontFamily:F}}>{existing?"Editing funnel":"Add a new sales lead"}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {!existing&&(
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.inkMuted,fontFamily:F}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#16A34A",animation:"pulse 2s infinite"}}/>
                Auto-saving
              </div>
            )}
            <button onClick={handleClose} style={{width:30,height:30,border:`1px solid ${T.line}`,borderRadius:T.r.md,background:T.surfaceEl,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={P.close} sz={13} color={T.inkSub}/></button>
          </div>
        </div>

        {/* ── Draft restore banner ── */}
        {showDraftBanner && draft && !existing && (
          <div style={{margin:"0",padding:"12px 24px",background:"rgba(91,59,232,0.08)",borderBottom:`1px solid rgba(91,59,232,0.15)`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <span style={{fontSize:14}}>📝</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#5B3BE8",fontFamily:F}}>You have an unsaved draft</div>
              <div style={{fontSize:11,color:"#5B3BE8",opacity:0.7,fontFamily:F}}>
                {draft.name ? `"${draft.name}"` : "Unnamed lead"} — saved earlier
              </div>
            </div>
            <button onClick={restoreDraft}
              style={{padding:"6px 14px",background:"#5B3BE8",color:"#fff",border:"none",borderRadius:T.r.md,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,flexShrink:0}}>
              Restore
            </button>
            <button onClick={discardDraft}
              style={{padding:"6px 14px",background:"transparent",color:"#5B3BE8",border:`1px solid rgba(91,59,232,0.3)`,borderRadius:T.r.md,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F,flexShrink:0}}>
              Discard
            </button>
          </div>
        )}

        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:20}}>
          <section>
            <SL T={T}>Contact details</SL>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="ek-form-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <FInput label="Name" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Customer name" required error={errs.name} T={T}/>
                <FInput label="Phone" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 98765 43210" required error={errs.phone} T={T}/>
                <FInput label="Email" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@company.com" T={T}/>
              </div>
              <FInput label="City / Region" value={form.cityRegion} onChange={e=>set("cityRegion",e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" T={T}/>
            </div>
          </section>
          <section>
            <SL T={T}>Funnel details</SL>
            <div className="ek-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <FSelect label="Enquiry type" value={form.enquiryType} onChange={e=>set("enquiryType",e.target.value)} options={ENQS} required error={errs.enquiryType} T={T}/>
              <FSelect label="Funnel type" value={form.funnelType} onChange={e=>set("funnelType",e.target.value)} options={FTYPES} required error={errs.funnelType} T={T}/>
            </div>
            <div className="ek-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FSelect label="Lead source" required value={form.leadSource} onChange={e=>set("leadSource",e.target.value)} options={LEAD_SOURCES} placeholder="Select source…" error={errs.leadSource} T={T}/>
              {!isWon?(<div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:500,color:T.inkSub,fontFamily:F}}>Next follow-up<span style={{color:"#DC2626",marginLeft:2}}>*</span></label><input type="date" value={form.nextFollowUp} onChange={e=>set("nextFollowUp",e.target.value)} style={{...inpSx(errs.nfu)}} onFocus={fo} onBlur={bl}/>{errs.nfu&&<span style={{fontSize:11,color:"#B91C1C"}}>{errs.nfu}</span>}</div>):(<div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:500,color:T.inkMuted,fontFamily:F}}>Next follow-up</label><div style={{padding:"8px 11px",background:T.won.bg,border:`1px solid ${T.won.dot}33`,borderRadius:T.r.md,fontSize:13,color:T.won.text,fontFamily:F,display:"flex",alignItems:"center",gap:6}}><Dot color={T.won.dot} size={6}/> Not required for Won deals</div></div>)}
            </div>
            {(form.status==="Lost"||form.status==="Drop")&&(
              <div style={{marginTop:10,padding:"14px 16px",background:form.status==="Lost"?T.lost.bg:T.drop.bg,border:`1px solid ${form.status==="Lost"?T.lost.dot:T.drop.dot}44`,borderRadius:T.r.lg,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Dot color={form.status==="Lost"?T.lost.dot:T.drop.dot} size={7}/>
                  <span style={{fontSize:12,fontWeight:600,color:form.status==="Lost"?T.lost.text:T.drop.text,fontFamily:F}}>
                    {form.status==="Lost"?"Why was this lead lost?":"Why was this lead dropped?"}
                  </span>
                </div>
                <textarea
                  value={form.lostDropReason}
                  onChange={e=>set("lostDropReason",e.target.value)}
                  placeholder={form.status==="Lost"?"e.g. Price too high, went to competitor…":"e.g. Duplicate entry, wrong number…"}
                  rows={3}
                  style={{...inpSx(),padding:"9px 11px",resize:"vertical",lineHeight:1.6,fontSize:13}}
                  onFocus={fo} onBlur={bl}/>
              </div>
            )}
          </section>
          {FULL.includes(user?.role)&&creUsers.length>0&&(<section><SL T={T}>Assign to</SL><FSelect label="Assign to CRE" value={form.assignedTo} onChange={e=>set("assignedTo",e.target.value)} options={creUsers.map(u=>u.name)} placeholder="Select team member…" T={T}/>{form.assignedTo&&<div style={{marginTop:8,fontSize:12,color:T.inkSub,fontFamily:F}}>📋 This funnel will appear in <strong style={{color:"#5B3BE8"}}>{form.assignedTo}</strong>'s dashboard</div>}</section>)}
          <section>
            <SL T={T}>Customer requirements</SL>
            <div style={{border:`1px solid ${errs.products?T.lost.dot:T.line}`,borderRadius:T.r.lg,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2.5fr 1.4fr .8fr 1fr .35fr",padding:"8px 14px",background:T.surfaceEl,gap:8}}>{["Product / item *","Category","Qty","Unit price (₹)",""].map(h=><div key={h} style={{fontSize:10,fontWeight:600,color:T.inkMuted,letterSpacing:"0.06em",fontFamily:F}}>{h}</div>)}</div>
              {form.products.map((pr,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"2.5fr 1.4fr .8fr 1fr .35fr",padding:"9px 14px",borderTop:`1px solid ${T.line}`,gap:8,alignItems:"center"}}>
                <input value={pr.desc} onChange={e=>sp(i,"desc",e.target.value)} placeholder="e.g. Bridal Lehenga" style={{...inpSx(),padding:"6px 9px",fontSize:12}} onFocus={fo} onBlur={bl}/>
                <select value={pr.category} onChange={e=>sp(i,"category",e.target.value)} style={{...inpSx(),padding:"6px 24px 6px 9px",fontSize:12,cursor:"pointer",appearance:"none",background:`${T.surface} ${selectBg}`}} onFocus={fo} onBlur={bl}><option value="">Category</option>{cats.map(c=><option key={c}>{c}</option>)}</select>
                {[["qty","0"],["price","0"]].map(([k,ph])=>(<input key={k} type="number" value={pr[k]} onChange={e=>sp(i,k,e.target.value)} placeholder={ph} style={{...inpSx(),padding:"6px 9px",fontSize:12}} onFocus={fo} onBlur={bl}/>))}
                <button onClick={()=>set("products",form.products.filter((_,x)=>x!==i))} disabled={form.products.length===1} style={{background:"none",border:"none",cursor:form.products.length===1?"not-allowed":"pointer",color:T.inkMuted,fontSize:16,opacity:form.products.length===1?.2:1,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>))}
              <div style={{padding:"9px 14px",borderTop:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>set("products",[...form.products,{desc:"",category:"",qty:"",price:""}])} style={{background:"none",border:`1px dashed #5B3BE8`,borderRadius:T.r.sm,padding:"4px 12px",color:"#5B3BE8",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F,display:"inline-flex",alignItems:"center",gap:5}}><Ic d={P.plus} sz={11} color="#5B3BE8"/> Add item</button>
                {showAddCat ? (
                  <div style={{display:"inline-flex",alignItems:"center",gap:4}}>
                    <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCategory();if(e.key==="Escape")setShowAddCat(false);}} placeholder="New category…" autoFocus style={{...inpSx(),padding:"4px 8px",fontSize:12,width:130}} onFocus={fo} onBlur={bl}/>
                    <button onClick={addCategory} style={{background:"#5B3BE8",border:"none",borderRadius:T.r.sm,padding:"4px 8px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>Add</button>
                    <button onClick={()=>{setShowAddCat(false);setNewCat("");}} style={{background:"none",border:"none",cursor:"pointer",color:T.inkMuted,fontSize:16,lineHeight:1}}>×</button>
                  </div>
                ) : (
                  <button onClick={()=>setShowAddCat(true)} style={{background:"none",border:`1px dashed ${T.line}`,borderRadius:T.r.sm,padding:"4px 10px",color:T.inkSub,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F,display:"inline-flex",alignItems:"center",gap:4}}>＋ Add category</button>
                )}
              </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>{errs.products&&<span style={{fontSize:11,color:"#B91C1C",fontWeight:500}}>{errs.products}</span>}{prodTotal>0&&<span style={{fontSize:12,fontWeight:600,color:T.ink,fontFamily:F}}>Total: {inr(prodTotal)}</span>}</div>
              </div>
            </div>
          </section>
          <section>
            <SL T={T}>Remarks <span style={{color:"#DC2626"}}>*</span></SL>
            <textarea value={form.remarks} onChange={e=>set("remarks",e.target.value)} placeholder="Additional notes…" rows={2} style={{...inpSx(errs.remarks),padding:"9px 11px",resize:"vertical",lineHeight:1.5}} onFocus={fo} onBlur={bl}/>
            {errs.remarks&&<div style={{fontSize:11,color:"#B91C1C",marginTop:4}}>{errs.remarks}</div>}
          </section>
          <section>
            <SL T={T}>Delivery & Payment</SL>
            <div className="ek-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:500,color:T.inkSub,fontFamily:F}}>Delivery details <span style={{color:"#DC2626"}}>*</span></label><textarea value={form.deliveryDetails} onChange={e=>set("deliveryDetails",e.target.value)} placeholder="e.g. Delivery by Apr 20, doorstep…" rows={2} style={{...inpSx(errs.deliveryDetails),padding:"9px 11px",resize:"vertical",lineHeight:1.5}} onFocus={fo} onBlur={bl}/>{errs.deliveryDetails&&<div style={{fontSize:11,color:"#B91C1C",marginTop:4}}>{errs.deliveryDetails}</div>}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}><label style={{fontSize:12,fontWeight:500,color:T.inkSub,fontFamily:F}}>Payment terms</label><textarea value={form.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} placeholder="e.g. 50% advance, balance on delivery…" rows={2} style={{...inpSx(),padding:"9px 11px",resize:"vertical",lineHeight:1.5}} onFocus={fo} onBlur={bl}/></div>
            </div>
          </section>
          <section>
            <SL T={T}>Initial quotation</SL>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="ek-form-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <FInput label="Order Number" value={form.orderNumber} onChange={e=>set("orderNumber",e.target.value)} placeholder="Enter order number" T={T}/>
                <FInput label="Quantity" type="number" value={form.quoteQty} onChange={e=>set("quoteQty",e.target.value)} placeholder="0" required error={errs.quoteQty} T={T}/>
                <FInput label="Amount (₹)" type="number" value={form.quoteAmount} onChange={e=>set("quoteAmount",e.target.value)} placeholder="0" required error={errs.quoteAmount} T={T}/>
              </div>
              <div><label style={{fontSize:12,fontWeight:500,color:T.inkSub,marginBottom:5,display:"block",fontFamily:F}}>Description <span style={{color:"#DC2626"}}>*</span></label><textarea value={form.quoteDesc} onChange={e=>set("quoteDesc",e.target.value)} placeholder="Quote notes…" rows={2} style={{...inpSx(errs.quoteDesc),padding:"9px 11px",resize:"vertical",lineHeight:1.5,width:"100%",boxSizing:"border-box"}} onFocus={fo} onBlur={bl}/>{errs.quoteDesc&&<div style={{fontSize:11,color:"#B91C1C",marginTop:4}}>{errs.quoteDesc}</div>}</div>
            </div>
          </section>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,padding:"14px 24px 22px",borderTop:`1px solid ${T.line}`,position:"sticky",bottom:0,background:T.surface,borderRadius:`0 0 ${T.r["2xl"]} ${T.r["2xl"]}`}}>
  
  {/* ── Existing deal toggle ── */}
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:form.isExisting?T.drop.bg:T.surfaceEl,border:`1px solid ${form.isExisting?T.drop.dot:T.line}`,borderRadius:T.r.md,transition:"all .2s"}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:16}}>{form.isExisting?"📁":"🆕"}</span>
      <div>
        <div style={{fontSize:12,fontWeight:600,color:form.isExisting?T.drop.text:T.ink,fontFamily:F_BODY}}>
          {form.isExisting?"Existing Deal":"New Deal"}
        </div>
        <div style={{fontSize:11,color:T.inkMuted,fontFamily:F_BODY}}>
          {form.isExisting?"Excluded from stats & analytics":"Counts in all stats & analytics"}
        </div>
      </div>
    </div>
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
      <span style={{fontSize:11,color:T.inkMuted,fontFamily:F_MONO,letterSpacing:"0.06em",textTransform:"uppercase"}}>
        {form.isExisting?"Mark as new":"Mark as existing"}
      </span>
      <div style={{position:"relative",width:36,height:20,borderRadius:10,background:form.isExisting?T.drop.dot:T.lineMid,transition:"background .2s",flexShrink:0,cursor:"pointer"}} onClick={()=>set("isExisting",!form.isExisting)}>
        <div style={{position:"absolute",top:2,left:form.isExisting?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
      </div>
    </label>
  </div>

  {/* ── Buttons row ── */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    {!existing ? (
      <div style={{fontSize:11,color:T.inkMuted,fontFamily:F_BODY,display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:13}}>💾</span> Draft auto-saved
      </div>
    ) : <div/>}
    <div style={{display:"flex",gap:10}}>
      <Btn ghost label="Cancel" onClick={handleClose} T={T}/>
      <Btn primary icon={existing?P.check:P.plus} label={existing?"Save changes":"Add funnel"} onClick={submit} T={T}/>
    </div>
  </div>

</div>
      </div>
    </div>
  );
}
