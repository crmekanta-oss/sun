import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { crmService } from "./services/crmService.js";
import { supabase } from "./lib/supabase.js";
import { F_BODY, F_MONO, F, makeT } from "./theme/index.js";
import { Ic, P, Btn, Dot, Toaster, useToast, Avatar } from "./components/ui/index.jsx";
import { FULL, VIEWER, can, STATUS } from "./constants.js";
import { today, xls, greeting } from "./utils.js";
import { Sidebar }            from "./components/layout/Sidebar.jsx";
import { Topbar }             from "./components/layout/Topbar.jsx";
import { Stats }              from "./components/layout/Stats.jsx";
import { FilterBar }          from "./components/layout/FilterBar.jsx";
import { Table }              from "./components/layout/Table.jsx";
import { Team }               from "./components/layout/Team.jsx";
import { KanbanBoard }        from "./components/layout/KanbanBoard.jsx";
import { Tasks }              from "./components/layout/Tasks.jsx";
import { Contacts }           from "./components/layout/Contacts.jsx";
import { Dashboard }          from "./components/layout/Dashboard.jsx";
import { NotificationCenter, SalesTargets } from "./components/layout/Notifications.jsx";
import { Analytics }          from "./components/analytics/index.jsx";
import { FunnelForm }         from "./components/modals/FunnelForm.jsx";
import { CREEditModal }       from "./components/modals/CREEditModal.jsx";
import { WonProofModal }      from "./components/modals/WonProofModal.jsx";
import { FollowupLogModal }   from "./components/modals/FollowupLogModal.jsx";
import { ViewDrawer }         from "./components/modals/ViewDrawer.jsx";
import { NewOrExistingModal } from "./components/modals/NewOrExistingModal.jsx";
import { CSVImportModal }     from "./components/modals/CSVImportModal.jsx";
import { BulkEditModal }     from "./components/modals/BulkEditModal.jsx";
import { Settings }           from "./components/layout/Settings.jsx";
import { ErrorBoundary }      from "./components/ErrorBoundary.jsx";
import { usePresence }        from "./hooks/usePresence.js";
import { OnlineAvatarCluster, PresencePanel, FunnelViewers } from "./components/layout/PresencePanel.jsx";

// ─── FUNNELS MONTH TOOLBAR ────────────────────────────────────────────────────
function FunnelsToolbar({ filtered, selectedIds, monthFilter, setMonthFilter, viewMode, setViewMode, T, months }) {

  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, zIndex: 5 }}>
      {/* Month strip */}
      <div style={{ padding: "10px 24px 0", display: "flex", alignItems: "center", gap: 10 }}>
        {/* "All" pill */}
        <button
          onClick={() => setMonthFilter("")}
          style={{
            flexShrink: 0, height: 30, padding: "0 14px",
            borderRadius: 20, border: `1.5px solid ${!monthFilter ? T.brand : T.line}`,
            background: !monthFilter ? T.brand : "transparent",
            color: !monthFilter ? "#fff" : T.inkSub,
            fontSize: 12, fontWeight: !monthFilter ? 700 : 500,
            cursor: "pointer", transition: "all .14s", whiteSpace: "nowrap",
          }}>
          All Time
        </button>

        {/* Scrollable month pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, flex: 1, scrollbarWidth: "none" }}
          className="ek-filter-scroll">
          {months.map(({ key, label }) => {
            const active = monthFilter === key;
            return (
              <button key={key}
                onClick={() => setMonthFilter(active ? "" : key)}
                style={{
                  flexShrink: 0, height: 30, padding: "0 14px",
                  borderRadius: 20, border: `1.5px solid ${active ? T.brand : T.line}`,
                  background: active ? T.brand : "transparent",
                  color: active ? "#fff" : T.inkSub,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: "pointer", transition: "all .14s", whiteSpace: "nowrap",
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead count + view toggle row */}
      <div style={{ padding: "6px 24px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{filtered.length}</span>
          <span style={{ fontSize: 12, color: T.inkMuted }}>leads</span>
          {monthFilter && (
            <span style={{ fontSize: 11, color: T.brand, background: T.brandSubtle, padding: "2px 10px", borderRadius: 10, fontWeight: 600, border: `1px solid ${T.brand}33` }}>
              {new Date(monthFilter + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </span>
          )}
          {selectedIds.size > 0 && (
            <span style={{ fontSize: 11, color: T.brand, background: T.brandSubtle, padding: "2px 10px", borderRadius: 12, fontWeight: 600, border: `1px solid ${T.brand}33` }}>
              {selectedIds.size} selected
            </span>
          )}
        </div>
        <div style={{ display: "flex", background: T.surfaceEl, border: `1px solid ${T.line}`, borderRadius: 9, overflow: "hidden", padding: 2, gap: 2 }}>
          {[["table", "Table"], ["kanban", "Board"]].map(([id, label]) => (
            <button key={id} onClick={() => setViewMode(id)}
              style={{ padding: "5px 14px", fontSize: 12, fontWeight: viewMode === id ? 600 : 400, border: "none", borderRadius: 7, cursor: "pointer", background: viewMode === id ? T.surface : "transparent", color: viewMode === id ? T.ink : T.inkMuted, transition: "all .15s", boxShadow: viewMode === id ? T.shadowSm : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Shell({user,users,onLogout,onUsersChange,T,dark,onToggleDark,themeId,setTheme}) {
  const [funnels,setFunnels]=useState([]);
  const [loading,setLoading]=useState(true);
  const { view: urlView } = useParams();
  const navigate = useNavigate();

  // Allowed views; default to "dashboard" if invalid param
  const VALID_VIEWS = ["dashboard", "funnels", "analytics", "team", "tasks", "contacts", "settings"];
  const view = VALID_VIEWS.includes(urlView) ? urlView : "dashboard";

  const setView = (v) => { setStatFilter(null); navigate("/" + v); };

  const [search,setSearch]=useState("");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [statFilter,setStatFilter]=useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [dateType, setDateType]     = useState("followup");
  const localMonthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const [monthFilter, setMonthFilter] = useState(()=>localMonthKey());
  const [viewMode, setViewMode]     = useState("table"); // "table" | "kanban"
  const [showNotifs, setShowNotifs] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => { try { return JSON.parse(localStorage.getItem("ek_recent")||"[]"); } catch { return []; } });

  useEffect(()=>{
    const fetch=async()=>{try{const data=await crmService.getAllFunnels();setFunnels(data);}catch(err){console.error(err);}finally{setLoading(false);}};
    fetch();
  },[]);

  useEffect(()=>{
    const channel=supabase.channel('funnels_changes').on('postgres_changes',{event:'*',schema:'public',table:'funnels'},(payload)=>{
      if(payload.eventType==='INSERT'){const nf=crmService.mapFromDb(payload.new);setFunnels(prev=>prev.find(f=>f.id===nf.id)?prev:[nf,...prev]);}
      else if(payload.eventType==='UPDATE'){const uf=crmService.mapFromDb(payload.new);setFunnels(prev=>prev.map(f=>f.id===uf.id?uf:f));}
      else if(payload.eventType==='DELETE'){setFunnels(prev=>prev.filter(f=>f.id!==payload.old.id));}
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[]);

  const [funnelComments,setFunnelComments]=useState({});
  const [viewT,setViewT]=useState(null);

  // ── Live presence ──────────────────────────────────────────────────────────
  const { onlineUsers, viewersOf, presenceMap } = usePresence(user, view, viewT);

  useEffect(()=>{if(viewT&&!funnelComments[viewT.id]){crmService.getComments(viewT.id).then(comments=>{setFunnelComments(prev=>({...prev,[viewT.id]:comments}));}).catch(console.error);}},[viewT,funnelComments]);

  useEffect(()=>{
    const channel=supabase.channel('comments_changes').on('postgres_changes',{event:'INSERT',schema:'public',table:'audit_comments'},async(payload)=>{
      const funnelId=payload.new.funnel_id;
      const newComment={text:payload.new.text,author:payload.new.author,role:payload.new.role,time:new Date(payload.new.created_at).toLocaleString('en-IN',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})};
      setFunnelComments(prev=>({...prev,[funnelId]:[...(prev[funnelId]||[]),newComment]}));
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[]);

  const addComment=async(funnelId,comment)=>{try{await crmService.addComment(funnelId,comment);}catch(err){console.error(err);}};
  useEffect(()=>{
    const channel=supabase.channel('followuplogs_changes').on('postgres_changes',{event:'INSERT',schema:'public',table:'followup_logs'},async(payload)=>{
      const funnelId=payload.new.funnel_id;
      const newLog={
        id:payload.new.id,
        loggedBy:payload.new.logged_by,
        loggedAt:new Date(payload.new.logged_at).toLocaleString('en-IN',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}),
        followUpDate:payload.new.follow_up_date,
        customerResponse:payload.new.customer_response,
        outcome:payload.new.outcome,
        nextFollowUp:payload.new.next_follow_up,
      };
      setFollowupLogs(prev=>({...prev,[funnelId]:[...(prev[funnelId]||[]),newLog]}));
    }).subscribe();
    return()=>{supabase.removeChannel(channel);};
  },[]);
  const [followupLogs,setFollowupLogs]=useState({});
  const [logModalFunnel,setLogModalFunnel]=useState(null);
  const [proofModalFunnel,setProofModalFunnel]=useState(null);
  const [pendingExistingCheck, setPendingExistingCheck] = useState(null);

  useEffect(()=>{if(viewT&&!followupLogs[viewT.id]){crmService.getFollowupLogs(viewT.id).then(logs=>{setFollowupLogs(prev=>({...prev,[viewT.id]:logs}));}).catch(console.error);}},[viewT,followupLogs]);

  // ── Recently viewed tracking ───────────────────────────
  const trackView = (f) => {
    setRecentlyViewed(prev => {
      const next = [f, ...prev.filter(r => r.id !== f.id)].slice(0, 5);
      try { localStorage.setItem("ek_recent", JSON.stringify(next)); } catch {}
      return next;
    });
    setViewT(f);
  };

  // ── Duplicate detection ─────────────────────────────────
  const checkDuplicate = (phone) => {
    if (!phone) return null;
    const clean = phone.replace(/\D/g, "");
    return funnels.find(f => f.phone && f.phone.replace(/\D/g,"") === clean);
  };

  // ── CSV import ──────────────────────────────────────────
  const handleCSVImport = async (leads) => {
    for (const lead of leads) {
      try {
        const saved = await crmService.saveFunnel(lead, user);
        setFunnels(p => [saved, ...p]);
      } catch(e) { console.error("Import error", e); }
    }
    push(`Imported ${leads.length} leads ✓`, "success");
    setShowCSVImport(false);
  };

  const saveFollowupLog=async(log)=>{
    try{
      await crmService.addFollowupLog(logModalFunnel.id,log);
      // Only update next_follow_up if provided (not a closed outcome)
      if(log.nextFollowUp){
        await crmService.updateNextFollowup(logModalFunnel.id,log.nextFollowUp);
        setFunnels(p=>p.map(f=>f.id===logModalFunnel.id?{...f,nextFollowUp:log.nextFollowUp}:f));
      }
      const updated=await crmService.getFollowupLogs(logModalFunnel.id);
      setFollowupLogs(prev=>({...prev,[logModalFunnel.id]:updated}));
      setLogModalFunnel(null); push("Follow-up logged ✓");
    }catch(err){console.error(err);push("Error saving follow-up","error");}
  };

  const saveProof=async(url)=>{
    try{
      await crmService.updateWonProof(proofModalFunnel.id, url);
      setFunnels(p=>p.map(f=>f.id===proofModalFunnel.id?{...f,wonProofUrl:url}:f));
      if(viewT&&viewT.id===proofModalFunnel.id) setViewT(v=>({...v,wonProofUrl:url}));
      push(url?"Proof saved ✓":"Proof removed","success");
    }catch(e){console.error(e);push("Error saving proof","error");}
  };

  const [fil,setFil]=useState({status:"",funnelType:"",enquiryType:"",leadSource:"",descFilter:"",cre:"",missed:false,todayF:false,upcoming:false,assignedTo:"",city:"",category:"",dateFrom:"",dateTo:"",followFrom:"",followTo:"",minAmt:"",maxAmt:"",hasOrder:"",hasQuote:"",overdue:false,wonMonth:false});
  const [addOpen,setAddOpen]=useState(false);
  const [editT,setEditT]=useState(null);
  const [creEditT,setCreEditT]=useState(null);
  const {list:toasts,push}=useToast();
  const TODAY=today();

  const sf=(k,v)=>setFil(f=>({...f,[k]:v}));
  const rf=()=>{setFil({status:"",funnelType:"",enquiryType:"",leadSource:"",descFilter:"",cre:"",missed:false,todayF:false,upcoming:false,assignedTo:"",city:"",category:"",dateFrom:"",dateTo:"",followFrom:"",followTo:"",minAmt:"",maxAmt:"",hasOrder:"",hasQuote:"",overdue:false,wonMonth:false});setStatFilter(null);setMonthFilter(localMonthKey());};
  const handleStatClick=(filterKey)=>{setStatFilter(prev=>prev===filterKey?null:filterKey);setFil(f=>({...f,status:""}));};

  const scoped=useMemo(()=>(FULL.includes(user.role)||VIEWER.includes(user.role))?funnels:funnels.filter(f=>f.createdBy===user.name||f.assignedTo===user.name),[funnels,user]);
  const statsScoped = useMemo(
  () => scoped.filter(f => !f.isExisting),
  [scoped]
);

  const months = useMemo(() => {
    const monthSet = new Set();
    scoped.forEach(f => {
      try {
        const d = new Date(f.createdAt);
        if (!isNaN(d)) {
          monthSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
        }
      } catch {}
    });
    monthSet.add(localMonthKey());
    if (monthFilter) monthSet.add(monthFilter);
    return [...monthSet]
      .sort((a,b) => b.localeCompare(a))
      .map(key => {
        const [year, month] = key.split("-");
        const d = new Date(Number(year), Number(month) - 1, 1);
        return { key, label: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }) };
      });
  }, [scoped, monthFilter]);

  // ㉒ today's follow-ups list + count for bell
  const todayFunnels=useMemo(()=>scoped
    .filter(f=>f.nextFollowUp&&f.status==="Pending")
    .sort((a,b)=>a.nextFollowUp.localeCompare(b.nextFollowUp)),[scoped,TODAY]);
  const todayCount=useMemo(()=>scoped.filter(f=>f.nextFollowUp===TODAY&&f.status==="Pending").length,[scoped,TODAY]);

  const filtered=useMemo(()=>scoped.filter(f=>{
    if(f.isExisting)return false;
    if(statFilter&&f.status!==statFilter)return false;
    if(search){const q=search.toLowerCase();const matches=(f.name||"").toLowerCase().includes(q)||(f.email||"").toLowerCase().includes(q)||(f.phone||"").toLowerCase().includes(q)||(f.orderNumber||"").toLowerCase().includes(q)||(f.remarks||"").toLowerCase().includes(q)||(f.cityRegion||"").toLowerCase().includes(q)||(f.deliveryDetails||"").toLowerCase().includes(q)||(f.quoteDesc||"").toLowerCase().includes(q)||((f.products||[]).some(p=>(p.desc||"").toLowerCase().includes(q)));if(!matches)return false;}
    if(!statFilter&&fil.status&&f.status!==fil.status)return false;
    if(fil.funnelType&&f.funnelType!==fil.funnelType)return false;
    if(fil.enquiryType&&f.enquiryType!==fil.enquiryType)return false;
    if(fil.leadSource&&f.leadSource!==fil.leadSource)return false;
    if(fil.descFilter){const q=fil.descFilter.toLowerCase();if(!(f.remarks||"").toLowerCase().includes(q)&&!(f.quoteDesc||"").toLowerCase().includes(q))return false;}
    if(fil.cre&&f.createdBy!==fil.cre&&f.assignedTo!==fil.cre)return false;
    if(fil.missed&&(!f.nextFollowUp||f.nextFollowUp>=TODAY||f.status!=="Pending"))return false;
    if(fil.todayF&&f.nextFollowUp!==TODAY)return false;
    if(fil.upcoming&&f.nextFollowUp<=TODAY)return false;
    // New filters
    if(fil.assignedTo&&f.assignedTo!==fil.assignedTo)return false;
    if(fil.city){const q=fil.city.toLowerCase();if(!(f.cityRegion||"").toLowerCase().includes(q))return false;}
    if(fil.category){const hascat=(f.products||[]).some(p=>p.category===fil.category);if(!hascat)return false;}
    if(fil.dateFrom){try{const d=new Date(f.createdAt).toISOString().split("T")[0];if(d<fil.dateFrom)return false;}catch{return false;}}
    if(fil.dateTo){try{const d=new Date(f.createdAt).toISOString().split("T")[0];if(d>fil.dateTo)return false;}catch{return false;}}
    if(fil.followFrom&&f.nextFollowUp&&f.nextFollowUp<fil.followFrom)return false;
    if(fil.followTo&&f.nextFollowUp&&f.nextFollowUp>fil.followTo)return false;
    if(fil.minAmt&&(Number(f.quoteAmount)||0)<Number(fil.minAmt))return false;
    if(fil.maxAmt&&(Number(f.quoteAmount)||0)>Number(fil.maxAmt))return false;
    if(fil.hasOrder==="yes"&&!f.orderNumber)return false;
    if(fil.hasOrder==="no"&&f.orderNumber)return false;
    if(fil.hasQuote==="yes"&&!f.quoteAmount)return false;
    if(fil.hasQuote==="no"&&f.quoteAmount)return false;
    if(fil.overdue&&!(f.nextFollowUp&&f.nextFollowUp<TODAY&&f.status==="Pending"))return false;
    if(fil.wonMonth){const m=localMonthKey();try{if(f.status!=="Won"||localMonthKey(new Date(f.createdAt))!==m)return false;}catch{return false;}}
    if (monthFilter) {
      try {
        const d = new Date(f.createdAt);
        if (isNaN(d) || localMonthKey(d) !== monthFilter) return false;
      } catch { return false; }
    }
    if (dateFilter) {
  if (dateType === "followup") {
    if (f.nextFollowUp !== dateFilter) return false;
    if (f.status === "Won" || f.status === "Lost" || f.status === "Drop") return false;
  } else {
    try {
      const d = new Date(f.createdAt);
      if (isNaN(d) || d.toISOString().split("T")[0] !== dateFilter) return false;
    } catch { return false; }
  }
}
return true;
  }),[scoped,search,fil,statFilter,TODAY,dateFilter,dateType,monthFilter]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(f => f.id)));
  const selectedFunnels = filtered.filter(f => selectedIds.has(f.id));

  const bulkUpdate = async (ids, fields) => {
    try {
      // Handle __clear__ for assignedTo
      const payload = { ...fields };
      if (payload.assignedTo === "__clear__") payload.assignedTo = "";
      await crmService.bulkUpdate(ids, payload);
      setFunnels(p => p.map(f => ids.includes(f.id) ? { ...f, ...Object.fromEntries(Object.entries(payload).map(([k,v])=>[k,v||null])) } : f));
      setSelectedIds(new Set());
      push(`Updated ${ids.length} leads ✓`);
    } catch (err) { console.error(err); push("Bulk update failed","error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await crmService.deleteFunnel(id);
      setFunnels(p => p.filter(f => f.id !== id));
      push("Deleted", "info");
    } catch (err) {
      console.error(err);
      push("Error deleting funnel", "error");
    }
  };

  const upStatus = async (id, s, reason = "") => {
    try {
      await crmService.updateStatus(id, s, reason);
      setFunnels(p => p.map(f => f.id === id ? { ...f, status: s, lostDropReason: reason } : f));
      push(`Status → ${s}`);
    } catch (err) {
      console.error(err);
      push("Error updating status", "error");
    }
  };

  const creEditSave = async (form) => {
    try {
      const saved = await crmService.saveFunnel(form, user);
      setFunnels(p => p.map(f => f.id === saved.id ? saved : f));
      setCreEditT(null);
      push("Updated ✓");
    } catch (err) {
      console.error(err);
      push("Error saving", "error");
    }
  };
  
  const save = async (form) => {
  try {
    // Duplicate detection for new leads
    if (!editT && form.phone) {
      const dup = checkDuplicate(form.phone);
      if (dup) {
        const go = window.confirm(`⚠️ A lead with phone "${form.phone}" already exists:\n"${dup.name}" (${dup.status})\n\nSave anyway?`);
        if (!go) return;
      }
    }
    const cleanedForm = {
      ...form,
      products: (form.products || []).filter(p => p.desc || p.category || p.qty || p.price)
    };
    const saved = await crmService.saveFunnel(cleanedForm, user);
    if (editT) {
      setFunnels(p => p.map(f => f.id === saved.id ? saved : f));
      setEditT(null); push("Funnel updated");
    } else {
      setFunnels(p => [saved, ...p]);
      setAddOpen(false);
      setPendingExistingCheck(saved);
      push("Funnel added");
    }
  } catch (err) {
    console.error(err);
    push(`Error: ${err.message || "Could not save lead"}`, "error");
  }
};

  const handleExistingSelect = async (isExisting) => {
  if (!pendingExistingCheck) return;

  try {
    if (isExisting) {
      const updated = await crmService.saveFunnel(
        { ...pendingExistingCheck, isExisting: true },
        user
      );

      setFunnels(p =>
        p.map(f => f.id === updated.id ? updated : f)
      );

      push("Marked as existing deal — excluded from stats", "info");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setPendingExistingCheck(null);
  }
};

  // Page title
  const titles = {dashboard:"Dashboard",funnels:"Funnels",analytics:"Analytics",team:"Team",tasks:"Tasks",contacts:"Contacts",settings:"Settings"};
  useEffect(() => { document.title = `${titles[view]||"Suntronix"} · Suntronix CRM`; }, [view]);

  // Escape key closes modals
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      if (bulkEditOpen) { setBulkEditOpen(false); return; }
      if (showNotifs)   { setShowNotifs(false);   return; }
      if (showCSVImport){ setShowCSVImport(false); return; }
      if (viewT)        { setViewT(null);          return; }
      if (editT)        { setEditT(null);          return; }
      if (addOpen)      { setAddOpen(false);       return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bulkEditOpen, showNotifs, showCSVImport, viewT, editT, addOpen]);

  // Keyboard shortcut: N = new lead, / = focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && can(user,"create")) { setAddOpen(true); }
      if (e.key === "/" ) { document.querySelector('input[placeholder*="Search"]')?.focus(); e.preventDefault(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [user]);
  const showFilters = view==="funnels";
  const showStats   = false; // dashboard has its own full-page component now
  const notifCount=useMemo(()=>{
    const td=today();
    return scoped.filter(f=>f.status==="Pending"&&f.nextFollowUp&&f.nextFollowUp<=td).length;
  },[scoped]);

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg,fontFamily:F}} className="ek-shell">
      <Sidebar active={view} set={setView} user={user} onLogout={onLogout} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} T={T} dark={dark} onToggleDark={onToggleDark} collapsed={sidebarCollapsed} onToggleCollapse={()=>setSidebarCollapsed(x=>!x)} onlineUsers={onlineUsers}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,height:"100vh",overflow:"hidden"}} className="ek-main-col">
{selectedIds.size > 0 && (
  <div style={{background:T.surface,borderBottom:`1px solid ${T.brand}33`,borderTop:`3px solid ${T.brand}`,padding:"10px 24px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",boxShadow:`0 2px 12px ${T.brand}18`}}>
    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
      <div style={{width:22,height:22,borderRadius:6,background:T.brand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{selectedIds.size}</div>
      <span style={{fontSize:13,fontWeight:600,color:T.ink}}>leads selected</span>
    </div>
    {!VIEWER.includes(user.role) && <Btn primary sm icon={P.edit} label={`Bulk Edit`} onClick={() => setBulkEditOpen(true)} T={T}/>}
    {!VIEWER.includes(user.role) && can(user,"export") && <Btn ghost sm icon={P.dl} label={`Export`} onClick={() => { xls(selectedFunnels, `Suntronix_Selected_${TODAY}.xls`); push(`Exported ${selectedIds.size} leads`, "info"); }} T={T}/>}
    {FULL.includes(user.role) && <Btn danger sm label="Delete" onClick={async()=>{if(!window.confirm(`Delete ${selectedIds.size} leads? This cannot be undone.`))return;for(const id of selectedIds){await crmService.deleteFunnel(id);}setFunnels(p=>p.filter(f=>!selectedIds.has(f.id)));setSelectedIds(new Set());push(`Deleted ${selectedIds.size} leads`,"info");}} T={T}/>}
    <button onClick={() => setSelectedIds(new Set())} style={{height:30,padding:"0 12px",background:"transparent",border:`1px solid ${T.line}`,borderRadius:7,fontSize:12,color:T.inkMuted,cursor:"pointer"}}>Clear ×</button>
  </div>
)}
<Topbar title={titles[view]} search={search} setSearch={setSearch} user={user} onAdd={()=>setAddOpen(true)}
  onExportAll={()=>{xls(scoped,`Suntronix_All_${TODAY}.xls`);push(`Exported ${scoped.length} funnels`,"info");}}
  onExportFiltered={()=>{xls(filtered,`Suntronix_Filtered_${TODAY}.xls`);push(`Exported ${filtered.length} funnels`,"info");}}
  fLen={filtered.length} aLen={scoped.length} onMenuToggle={()=>setSidebarOpen(x=>!x)} T={T} todayCount={todayCount}
  dateFilter={dateFilter} setDateFilter={setDateFilter} dateType={dateType} setDateType={setDateType} todayFunnels={todayFunnels}
  notifCount={notifCount} onNotifClick={()=>setShowNotifs(x=>!x)}
  onImportCSV={()=>setShowCSVImport(true)}/>

        {showFilters && (
          <div style={{background:T.surface,borderBottom:`1px solid ${T.line}`}}>
            <FilterBar fil={fil} setF={sf} reset={rf} users={users} user={user} T={T} funnels={scoped}/>
          </div>
        )}


        <div style={{flex:1,overflowY:"auto",background:T.bg,minHeight:0}} className="ek-page-content">
          {view==="funnels"&&(
            <FunnelsToolbar
              filtered={filtered} selectedIds={selectedIds}
              monthFilter={monthFilter} setMonthFilter={setMonthFilter}
              viewMode={viewMode} setViewMode={setViewMode}
              months={months}
              T={T}
            />
          )}

          {view==="dashboard"&&(
            <ErrorBoundary T={T}>
              <Dashboard funnels={statsScoped} user={user} onView={trackView} onAdd={()=>setAddOpen(true)} statFilter={statFilter} onStatClick={handleStatClick} recentlyViewed={recentlyViewed} T={T}/>
            </ErrorBoundary>
          )}
          {view==="funnels"&&viewMode==="table"&&(
            <ErrorBoundary T={T}><Table rows={filtered} user={user} onView={trackView} onEdit={f=>setEditT(f)} onCreEdit={f=>setCreEditT(f)} onDelete={del} onLogFollowup={f=>setLogModalFunnel(f)} onAddProof={f=>setProofModalFunnel(f)} loading={loading} T={T} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} viewersOf={viewersOf}/></ErrorBoundary>
          )}
          {view==="funnels"&&viewMode==="kanban"&&(
            <ErrorBoundary T={T}><KanbanBoard rows={filtered} user={user} onView={trackView} onEdit={f=>setEditT(f)} onLogFollowup={f=>setLogModalFunnel(f)} onStatusChange={upStatus} T={T}/></ErrorBoundary>
          )}
          {view==="analytics"&&<ErrorBoundary T={T}><Analytics funnels={FULL.includes(user.role)?funnels.filter(f=>!f.isExisting):statsScoped} T={T}/></ErrorBoundary>}
          {view==="tasks"&&<ErrorBoundary T={T}><Tasks user={user} funnels={scoped} T={T}/></ErrorBoundary>}
          {view==="contacts"&&<ErrorBoundary T={T}><Contacts funnels={scoped} onView={trackView} T={T}/></ErrorBoundary>}
          {view==="settings"&&<ErrorBoundary T={T}><Settings T={T} themeId={themeId} setTheme={setTheme} dark={dark} onToggleDark={onToggleDark} user={user} onLogout={onLogout} funnels={funnels}/></ErrorBoundary>}
          {view==="team"&&FULL.includes(user.role)&&<ErrorBoundary T={T}><Team users={users} onSave={onUsersChange} onlineUsers={onlineUsers} presenceMap={presenceMap} currentUser={user} T={T}/></ErrorBoundary>}
          {view==="team"&&!FULL.includes(user.role)&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:12,fontFamily:F}}>
              <div style={{fontSize:40}}>🔒</div>
              <div style={{fontSize:18,fontWeight:700,color:T.ink}}>Access Restricted</div>
              <div style={{fontSize:13,color:T.inkMuted,textAlign:"center",maxWidth:320}}>Team management is only available to CEO and Manager roles.</div>
              <button onClick={()=>setView("dashboard")} style={{marginTop:12,padding:"9px 22px",background:T.brand,color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${T.brand}44`}}>Go to Dashboard →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="ek-bottom-nav" style={{background:T.surface,borderTop:`1px solid ${T.line}`,boxShadow:"0 -4px 24px rgba(0,0,0,0.08)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
        {[
          {id:"dashboard",label:"Home",    icon:P.dash},
          {id:"funnels",  label:"Funnels", icon:P.list},
          {id:"contacts", label:"Contacts",icon:P.users},
          {id:"tasks",    label:"Tasks",   icon:P.check},
          {id:"analytics",label:"Charts",  icon:P.chart},
        ].map(item=>{
          const a=view===item.id;
          return (
            <button key={item.id} onClick={()=>setView(item.id)}
              className={`ek-bottom-nav-item${a?" active":""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d={item.icon} stroke={a?"#5B3BE8":T.inkMuted} strokeWidth={a?"2":"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{fontSize:10,fontWeight:a?700:400,color:a?"#5B3BE8":T.inkMuted,fontFamily:F,letterSpacing:"0.01em"}}>{item.label}</span>
            </button>
          );
        })}
        {can(user,"create")&&(
          <button onClick={()=>setAddOpen(true)}
            className="ek-bottom-nav-item"
            style={{background:"#5B3BE8",borderRadius:14,width:44,height:44,minWidth:"unset",padding:0,boxShadow:"0 4px 14px rgba(91,59,232,0.4)"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d={P.plus} stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </nav>

      {bulkEditOpen&&selectedFunnels.length>0&&(
        <BulkEditModal funnels={selectedFunnels} users={users} onClose={()=>setBulkEditOpen(false)} onSave={bulkUpdate} T={T}/>
      )}
      {showNotifs&&<NotificationCenter funnels={scoped} user={user} onView={f=>{trackView(f);setShowNotifs(false);}} onClose={()=>setShowNotifs(false)} T={T}/>}
      {showCSVImport&&<CSVImportModal onClose={()=>setShowCSVImport(false)} onImport={handleCSVImport} users={users} user={user} T={T}/>}
      {pendingExistingCheck && (
  <NewOrExistingModal
    onClose={() => setPendingExistingCheck(null)}
    onSelect={handleExistingSelect}
    T={T}
  />
)}
      
      {(addOpen||editT)&&<FunnelForm onClose={()=>{setAddOpen(false);setEditT(null);}} onSave={save} existing={editT} user={user} users={users} T={T}/>}
      {viewT&&<ViewDrawer funnel={viewT} onClose={()=>setViewT(null)} onEdit={f=>setEditT(f)} onCreEdit={f=>setCreEditT(f)} onStatusChange={upStatus} user={user} comments={funnelComments[viewT.id]||[]} onAddComment={addComment} followupLogs={followupLogs[viewT.id]||[]} onLogFollowup={()=>setLogModalFunnel(viewT)} onAddProof={f=>{setProofModalFunnel(f);}} T={T}/>}
      {creEditT&&<CREEditModal funnel={creEditT} onClose={()=>setCreEditT(null)} onSave={creEditSave} T={T}/>}
      {logModalFunnel&&!VIEWER.includes(user.role)&&<FollowupLogModal funnel={logModalFunnel} user={user} onClose={()=>setLogModalFunnel(null)} onSave={saveFollowupLog} T={T}/>
      }{proofModalFunnel&&<WonProofModal funnel={proofModalFunnel} onClose={()=>setProofModalFunnel(null)} onSave={saveProof} T={T}/>}
      <Toaster list={toasts} T={T}/>
    </div>
  );
}
