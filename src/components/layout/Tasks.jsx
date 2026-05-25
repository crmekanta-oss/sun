import React, { useState, useEffect } from "react";
import { F, F_MONO } from "../../theme/index.js";
import { Ic, P, Btn, Dot, Avatar, FInput, FSelect } from "../ui/index.jsx";
import { today, stamp } from "../../utils.js";
import { FULL, VIEWER } from "../../constants.js";

const PRIORITIES = ["High", "Medium", "Low"];
const TASK_TYPES = ["Call", "Follow-up", "Send Catalogue", "Meeting", "Email", "WhatsApp", "Other"];

const STORAGE_KEY = "ek_tasks_v1";

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveTasks(tasks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
}

export function Tasks({ user, funnels, T }) {
  const [tasks,    setTasks]    = useState(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState("all"); // all | today | overdue | done
  const [form,     setForm]     = useState({ title:"", type:"Call", priority:"Medium", dueDate:"", note:"", linkedFunnel:"" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const todayV = today();

  const addTask = () => {
    if (!form.title.trim()) return;
    const task = {
      id: Date.now() + Math.random(),
      title: form.title.trim(),
      type: form.type,
      priority: form.priority,
      dueDate: form.dueDate,
      note: form.note,
      linkedFunnel: form.linkedFunnel,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      done: false,
    };
    const updated = [task, ...tasks];
    setTasks(updated); saveTasks(updated);
    setForm({ title:"", type:"Call", priority:"Medium", dueDate:"", note:"", linkedFunnel:"" });
    setShowForm(false);
  };

  const toggleDone = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? stamp() : null } : t);
    setTasks(updated); saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated); saveTasks(updated);
  };

  const myTasks = FULL.includes(user.role)
    ? tasks
    : tasks.filter(t => t.createdBy === user.name);

  const filtered = myTasks.filter(t => {
    if (filter === "today")   return !t.done && t.dueDate === todayV;
    if (filter === "overdue") return !t.done && t.dueDate && t.dueDate < todayV;
    if (filter === "done")    return t.done;
    return !t.done;
  });

  const counts = {
    all:     myTasks.filter(t => !t.done).length,
    today:   myTasks.filter(t => !t.done && t.dueDate === todayV).length,
    overdue: myTasks.filter(t => !t.done && t.dueDate && t.dueDate < todayV).length,
    done:    myTasks.filter(t => t.done).length,
  };

  const priorityColor = {
    High:   { text: T.lost.text,    bg: T.lost.bg,    dot: T.lost.dot    },
    Medium: { text: T.pending.text, bg: T.pending.bg, dot: T.pending.dot },
    Low:    { text: T.won.text,     bg: T.won.bg,     dot: T.won.dot     },
  };

  const typeIcon = { Call:"📞", "Follow-up":"📅", "Send Catalogue":"📦", Meeting:"🤝", Email:"✉️", WhatsApp:"💬", Other:"📝" };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, fontFamily: F, margin: "0 0 4px" }}>Tasks</h2>
          <p style={{ fontSize: 13, color: T.inkMuted, fontFamily: F, margin: 0 }}>Your standalone activities and follow-up tasks</p>
        </div>
        {!VIEWER.includes(user.role) && (
          <Btn primary icon={P.plus} label="Add Task" onClick={() => setShowForm(true)} T={T} />
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["all","All"], ["today","Today"], ["overdue","Overdue"], ["done","Done"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter===id ? "#5B3BE8" : T.line}`, background: filter===id ? "#5B3BE8" : T.surface, color: filter===id ? "#fff" : T.inkSub, fontSize: 12, fontWeight: 500, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {label}
            {counts[id] > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: filter===id ? "rgba(255,255,255,0.25)" : T.surfaceEl, color: filter===id ? "#fff" : id==="overdue" ? T.lost.text : "#5B3BE8", padding: "0 5px", borderRadius: 8 }}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: T.surface, border: `1px solid #5B3BE888`, borderRadius: 10, padding: 18, marginBottom: 16, boxShadow: T.shadowMd }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, fontFamily: F, marginBottom: 14 }}>New Task</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <FInput label="Task title" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Call back Priya" T={T} required />
            <FSelect label="Type" value={form.type} onChange={e=>set("type",e.target.value)} options={TASK_TYPES} T={T} />
            <FSelect label="Priority" value={form.priority} onChange={e=>set("priority",e.target.value)} options={PRIORITIES} T={T} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 500, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)} min={todayV}
                style={{ width:"100%", padding:"8px 11px", border:`1px solid ${T.lineMid}`, borderRadius:4, fontSize:13, fontFamily:F, color:T.ink, background:T.surface, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 500, color: T.inkMuted, fontFamily: F_MONO, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Link to Lead (optional)</label>
              <select value={form.linkedFunnel} onChange={e=>set("linkedFunnel",e.target.value)}
                style={{ width:"100%", padding:"8px 11px", border:`1px solid ${T.lineMid}`, borderRadius:4, fontSize:13, fontFamily:F, color:T.ink, background:T.surface, outline:"none", appearance:"none", boxSizing:"border-box" }}>
                <option value="">No lead linked</option>
                {funnels.filter(f=>f.status==="Pending").map(f => <option key={f.id} value={f.id}>{f.name} — {f.phone}</option>)}
              </select>
            </div>
          </div>
          <FInput label="Note (optional)" value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Additional details…" T={T} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <Btn ghost label="Cancel" onClick={() => setShowForm(false)} T={T} />
            <Btn primary icon={P.check} label="Save Task" onClick={addTask} T={T} />
          </div>
        </div>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.inkMuted, fontFamily: F }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>
            {filter === "done" ? "No completed tasks" : "All caught up!"}
          </div>
          <div style={{ fontSize: 12 }}>
            {filter === "done" ? "Completed tasks will appear here" : "No tasks for this filter"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(task => {
            const pc = priorityColor[task.priority] || priorityColor.Medium;
            const isOverdue = !task.done && task.dueDate && task.dueDate < todayV;
            const isToday   = !task.done && task.dueDate === todayV;
            const linked = funnels.find(f => f.id === task.linkedFunnel);
            return (
              <div key={task.id}
                style={{ background: T.surface, border: `1px solid ${isOverdue ? T.lost.dot+"44" : T.line}`, borderRadius: 8, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: T.shadowSm, opacity: task.done ? 0.6 : 1 }}>
                {/* Checkbox */}
                <button onClick={() => toggleDone(task.id)}
                  style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? T.won.dot : T.lineMid}`, background: task.done ? T.won.dot : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all .15s" }}>
                  {task.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{typeIcon[task.type] || "📝"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: F, flex: 1, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: pc.bg, color: pc.text, fontFamily: F, border: `1px solid ${pc.dot}33`, flexShrink: 0 }}>{task.priority}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: isOverdue ? T.lost.text : isToday ? T.pending.text : T.inkMuted, fontFamily: F, fontWeight: isOverdue || isToday ? 600 : 400 }}>
                        {isOverdue ? "⚠ Overdue · " : isToday ? "📅 Today · " : "📅 "}{task.dueDate}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: T.inkMuted, fontFamily: F }}>{task.type}</span>
                    {linked && (
                      <span style={{ fontSize: 10, background: T.brandSubtle, color: "#5B3BE8", padding: "1px 7px", borderRadius: 10, fontFamily: F, fontWeight: 500 }}>
                        🔗 {linked.name}
                      </span>
                    )}
                    {task.doneAt && <span style={{ fontSize: 10, color: T.inkMuted, fontFamily: F }}>Done {task.doneAt}</span>}
                  </div>
                  {task.note && <div style={{ fontSize: 12, color: T.inkSub, fontFamily: F, marginTop: 5, fontStyle: "italic" }}>{task.note}</div>}
                </div>

                {/* Delete */}
                {!VIEWER.includes(user.role) && (
                  <button onClick={() => deleteTask(task.id)}
                    style={{ background: "transparent", border: `1px solid ${T.line}`, borderRadius: 4, padding: "3px 5px", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.lost.bg; e.currentTarget.style.borderColor = T.lost.dot; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.line; }}>
                    <Ic d={P.trash} sz={11} color={T.lost.dot} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
