import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

const CHANNEL_NAME = "ekanta-presence";

const PAGE_LABELS = {
  dashboard: "Dashboard", funnels: "Funnels", contacts: "Contacts",
  tasks: "Tasks", analytics: "Analytics", team: "Team", settings: "Settings",
};

const USER_COLORS = ["#4d7cfe","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

function stableColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return USER_COLORS[h % USER_COLORS.length];
}

export function usePresence(user, view, viewingFunnel = null) {
  const [presenceMap, setPresenceMap] = useState({});
  const channelRef = useRef(null);
  const myKey = user?.username || "anon";

  const buildPayload = useCallback(() => ({
    username:   user?.username,
    name:       user?.name,
    role:       user?.role,
    view,
    pageLabel:  PAGE_LABELS[view] || view,
    funnelId:   viewingFunnel?.id   || null,
    funnelName: viewingFunnel?.name || null,
    color:      stableColor(user?.name || ""),
    lastSeen:   Date.now(),
  }), [user, view, viewingFunnel]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: myKey } },
    });

    const syncState = () => {
      const state = channel.presenceState();
      const map = {};
      Object.entries(state).forEach(([key, presences]) => {
        if (key === myKey) return;
        const p = presences[0];
        if (p) map[key] = p;
      });
      setPresenceMap(map);
    };

    channel
      .on("presence", { event: "sync" }, syncState)
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key === myKey) return;
        setPresenceMap(prev => ({ ...prev, [key]: newPresences[0] }));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === myKey) return;
        setPresenceMap(prev => { const n = { ...prev }; delete n[key]; return n; });
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") channel.track(buildPayload());
      });

    channelRef.current = channel;
    const hb = setInterval(() => channel.track(buildPayload()), 20000);

    return () => { clearInterval(hb); supabase.removeChannel(channel); };
  }, [user?.username]); // reconnect only if user changes

  // Re-track on view/funnel change
  useEffect(() => {
    if (channelRef.current?._presence) {
      channelRef.current.track(buildPayload());
    }
  }, [view, viewingFunnel?.id]);

  const onlineUsers = Object.values(presenceMap);
  const viewersOf = (funnelId) => onlineUsers.filter(u => u.funnelId === funnelId);

  return { onlineUsers, viewersOf, presenceMap };
}
