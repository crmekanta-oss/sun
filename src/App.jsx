import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { crmService } from "./services/crmService";
import { useTheme, makeT, FontLoader, F } from "./theme/index.js";
import { SEED_USERS } from "./constants.js";
import { Login } from "./components/layout/Login.jsx";
import { Shell } from "./Shell.jsx";

// ─── SW UPDATE MODAL ──────────────────────────────────────────────────────────
// Shown when the Service Worker detects a new version is waiting.
// "Update now"  → tells the waiting SW to skip waiting, then reloads → new version
// "Later"       → dismisses the modal, keeps the current cached version running
function UpdateModal({ T, onUpdate, onLater }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10000,
      background:"rgba(0,0,0,0.50)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, animation:"fadeIn .2s ease",
      backdropFilter:"blur(3px)",
    }}>
      <div style={{
        background:T.surface, borderRadius:18,
        border:`1px solid ${T.lineMid}`,
        width:"100%", maxWidth:420,
        boxShadow:T.shadowXl,
        overflow:"hidden",
        animation:"fadeUp .22s ease",
      }}>
        {/* Header */}
        <div style={{
          background:T.brand, padding:"26px 28px 22px",
          display:"flex", flexDirection:"column", gap:6,
        }}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>
            New version available
          </div>
          <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:28}}>🚀</span> Suntronix CRM
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.5}}>
            A new version of the app is ready.<br/>
            <strong style={{color:"#fff"}}>Update now</strong> to get the latest features, or continue with the current version.
          </div>
        </div>

        {/* Info */}
        <div style={{padding:"20px 28px 8px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              ["⚡", "Update now", "Reloads the app with the latest version. Takes 2 seconds.", true],
              ["⏳", "Later", "Keep using the current version. You'll be asked again next time you open the app.", false],
            ].map(([icon, label, desc]) => (
              <div key={label} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 14px",borderRadius:10,background:T.surfaceEl,border:`1px solid ${T.line}`}}>
                <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:2}}>{label}</div>
                  <div style={{fontSize:12,color:T.inkMuted,lineHeight:1.5}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{padding:"16px 28px 26px",display:"flex",gap:10}}>
          <button
            onClick={onUpdate}
            style={{
              flex:1, padding:"11px 0", borderRadius:9, border:"none", cursor:"pointer",
              background:T.brand, color:"#fff",
              fontSize:13, fontWeight:700, transition:"background .15s",
              boxShadow:`0 4px 14px ${T.brand}44`,
            }}
            onMouseEnter={e=>e.currentTarget.style.background=T.brandHover}
            onMouseLeave={e=>e.currentTarget.style.background=T.brand}>
            Update now
          </button>
          <button
            onClick={onLater}
            style={{
              flex:1, padding:"11px 0", borderRadius:9, cursor:"pointer",
              background:"transparent", color:T.inkSub,
              border:`1px solid ${T.lineMid}`, fontSize:13, fontWeight:500,
              transition:"background .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=T.surfaceEl}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("ek-user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { themeId, setTheme, dark, toggleDark } = useTheme();
  const T = makeT(dark, themeId);
  const navigate = useNavigate();

  // ─── SW UPDATE STATE ───────────────────────────────────────────────────────
  // waitingSW holds the ServiceWorker that is installed but waiting to activate.
  // When the user clicks "Update now" we send it SKIP_WAITING then reload.
  // When the user clicks "Later" we dismiss the modal — the waiting SW stays
  // paused and will be offered again on the next page load.
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const waitingSWRef = React.useRef(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");

        const offerUpdate = (sw) => {
          waitingSWRef.current = sw;
          setShowUpdateModal(true);
        };

        // A new SW is already waiting (e.g. user refreshed after a deploy)
        if (reg.waiting) { offerUpdate(reg.waiting); return; }

        // Listen for a new SW installing
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            // installed + waiting = new version ready, old version still active
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              offerUpdate(newSW);
            }
          });
        });

        // Poll for updates every 60 seconds (catches deploys between refreshes)
        const interval = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(interval);
      } catch (err) {
        console.warn("SW registration failed:", err);
      }
    };

    registerSW();

    // When the SW is activated after skipWaiting, reload to get the new version
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }, []);

  const handleUpdateNow = () => {
    const sw = waitingSWRef.current;
    if (sw) sw.postMessage({ type: "SKIP_WAITING" });
    // reload happens automatically via controllerchange listener above
    setShowUpdateModal(false);
  };

  const handleUpdateLater = () => {
    // Dismiss — keep current version, waiting SW stays paused.
    // Next time they open the app the modal will appear again.
    setShowUpdateModal(false);
  };

  useEffect(() => {
    const fetch = async () => {
      try { const data = await crmService.getUsers(); setUsers(data?.length ? data : SEED_USERS); }
      catch { setUsers(SEED_USERS); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleLogin = (u) => {
    localStorage.setItem("ek-user", JSON.stringify(u));
    setUser(u); navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("ek-user");
    setUser(null); navigate("/login");
  };

  const handleUsersChange = async (newUsers) => {
    try {
      const cur = users.map(u => u.username);
      const del = cur.filter(u => !newUsers.map(u => u.username).includes(u));
      for (const un of del) await crmService.deleteUser(un);
      await crmService.saveUsers(newUsers);
      const data = await crmService.getUsers(); setUsers(data);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: F, gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 72, height: 72 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${T.line}` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: T.brand, animation: "spin .75s linear infinite" }} />
          <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: `linear-gradient(135deg, ${T.brand}, ${T.brandHover})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${T.brand}44` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: "-0.4px", marginBottom: 6 }}>Suntronix CRM</div>
          <div style={{ fontSize: 12, color: T.inkMuted, fontFamily: F, letterSpacing: "0.03em" }}>Loading your workspace…</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, opacity: 0.4, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <FontLoader dark={dark} themeId={themeId} />

      {showUpdateModal && (
        <UpdateModal T={T}
          onUpdate={handleUpdateNow}
          onLater={handleUpdateLater}
        />
      )}

      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login users={users} onLogin={handleLogin} T={T} dark={dark} onToggleDark={toggleDark} />} />
        <Route path="/:view" element={user
          ? <Shell user={user} users={users} onLogout={handleLogout} onUsersChange={handleUsersChange} T={T} dark={dark} onToggleDark={toggleDark} themeId={themeId} setTheme={setTheme} />
          : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}
