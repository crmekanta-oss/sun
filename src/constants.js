// ─── RBAC ─────────────────────────────────────────────────────────────────────
export const FULL   = ["CEO", "Manager"];
export const VIEWER = ["Viewer"];
export const can    = (u, a) => {
  if (VIEWER.includes(u?.role)) return false;
  if (a === "export") return FULL.includes(u?.role);
  return FULL.includes(u?.role) || a === "create";
};

// ─── DROPDOWN OPTION LISTS ────────────────────────────────────────────────────
export const DEFAULT_CATS = ["Laptop","Desktop","Mobile"];
export const CATS         = (() => {
  try {
    const stored = localStorage.getItem("suntronix_cats");
    return stored ? JSON.parse(stored) : DEFAULT_CATS;
  } catch { return DEFAULT_CATS; }
})();
export const ENQS         = ["New Customer","Repeat Customer","Bulk Order","Custom Design","Wholesale","Others"];
export const FTYPES       = ["Normal","High Value","Bulk","priority","Others"];
export const ROLES        = ["CEO","Manager","CRE","Viewer"];
export const STATUS       = ["Pending","Won","Lost","Drop"];
export const LEAD_SOURCES = ["WhatsApp","Email","Website","Call","Abandoned Cart","Social media","Other","Owner"];
export const OUTCOMES     = ["Interested","Needs Time","Callback Requested","Not Interested","Rescheduled","Order Confirmed","Other"];

// ─── SEED USERS ───────────────────────────────────────────────────────────────
export const SEED_USERS = [
  {id:1,name:"Admin",      role:"CEO",     username:"admin",     password:"admin123"},
  {id:2,name:"Vinodhini",  role:"CRE",     username:"vinodhini", password:"pass123" },
  {id:3,name:"Arjun Kumar",role:"Manager", username:"arjun",     password:"pass123" },
];
