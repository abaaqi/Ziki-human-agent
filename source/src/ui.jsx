import { useEffect, useRef, useState } from "react";
import { OWNER } from "./data.js";
import { useStore } from "./store.jsx";

/* ---------- Routing ---------- */

export function navigate(path) {
  if (window.location.hash !== `#${path}`) window.location.hash = path;
  window.scrollTo({ top: 0 });
}

export function A({ to, className = "", children, onClick, ...rest }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) window.scrollTo({ top: 0 });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ---------- Class strings copied from Ziki ---------- */

export const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";
export const agentsSurface = "rounded-[20px] border border-zk-border bg-zk-surface";
export const agentsLink = `font-semibold text-zk-accent hover:underline ${linkFocus}`;
export const primaryBtn =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-electric-blue-strong px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(46,111,239,0.30)] transition hover:bg-[#2552af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";
export const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-zk-border bg-zk-surface px-5 text-sm font-bold text-zk-text transition hover:bg-zk-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const dangerBtn =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-zk-bad-bd bg-zk-bad-soft px-5 text-sm font-bold text-zk-bad-fg transition hover:bg-zk-bad-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zk-bad-fg focus-visible:ring-offset-2";
/** The decision buttons: same height, quieter than Ziki's primary pill. */
export const smallPrimary =
  "inline-flex h-9 items-center justify-center rounded-full bg-electric-blue-strong px-3.5 text-[13px] font-bold text-white transition hover:bg-[#2552af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const smallSecondary =
  "inline-flex h-9 items-center justify-center rounded-full border border-zk-border bg-zk-surface px-3.5 text-[13px] font-bold text-zk-text transition hover:bg-zk-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const smallGhost =
  "inline-flex h-9 items-center justify-center rounded-full px-3 text-[13px] font-semibold text-zk-text2 transition hover:bg-zk-chip hover:text-zk-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";
export const chipBase = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold";
export const severityChip = {
  low: "bg-zk-chip text-zk-text2",
  medium: "border border-zk-warn-bd bg-zk-warn-bg text-zk-warn-fg",
  high: "bg-zk-bad-bg text-zk-bad-fg",
  critical: "border border-zk-bad-bd bg-zk-bad-bg text-zk-bad-fg",
};
export const levelBadge = {
  observer: "bg-zk-chip text-zk-text2",
  contributor: "bg-zk-ok-bg text-zk-ok-fg",
  triager: "bg-zk-warn-bg text-zk-warn-fg",
  reviewer: "bg-zk-info-bg text-zk-info-fg",
};

/* ---------- Icons (Lucide shapes, as Ziki uses) ---------- */

function Svg({ size = 16, stroke = 2, className = "", children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...rest}>
      {children}
    </svg>
  );
}

export const Icon = {
  Plus: (p) => <Svg stroke={2.5} {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  Bell: (p) => <Svg size={18} {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Svg>,
  Trophy: (p) => (
    <Svg size={13} {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" />
      <path d="M10 14.7V17c0 .6-.5 1-1 1.2-1.2.5-2 2-2 3.8" /><path d="M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Svg>
  ),
  Agent: (p) => <Svg {...p}><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 4v4" /><path d="M9 14h.01" /><path d="M15 14h.01" /></Svg>,
  ChevronDown: (p) => <Svg size={14} {...p}><path d="m6 9 6 6 6-6" /></Svg>,
  ChevronRight: (p) => <Svg size={12} stroke={2.2} {...p}><path d="m9 18 6-6-6-6" /></Svg>,
  Back: (p) => <Svg size={18} {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Svg>,
  Inbox: (p) => (
    <Svg {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </Svg>
  ),
  Merge: (p) => <Svg {...p}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></Svg>,
  Gear: (p) => (
    <Svg size={14} {...p}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  Search: (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Svg>,
  Filter: (p) => <Svg {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></Svg>,
  Monitor: (p) => <Svg stroke={1.8} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Svg>,
  Check: (p) => <Svg {...p}><path d="m5 12 4.5 4.5L19 7" /></Svg>,
  Bot: (p) => <Svg size={12} {...p}><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 4v4M9 14h.01M15 14h.01" /></Svg>,
  Bulb: (p) => <Svg size={12} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3Z" /></Svg>,
  Bid: (p) => <Svg size={12} {...p}><path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8" /></Svg>,
  Clock: (p) => <Svg size={12} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>,
  Shield: (p) => <Svg size={12} {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></Svg>,
  ShieldPlain: (p) => <Svg size={12} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>,
  User: (p) => <Svg size={12} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>,
  Alert: (p) => <Svg size={12} {...p}><path d="M12 9v4m0 4h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></Svg>,
  Pause: (p) => <Svg {...p}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></Svg>,
  Play: (p) => <Svg {...p}><path d="m7 4 13 8-13 8V4Z" /></Svg>,
  Comment: (p) => <Svg size={12} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>,
  X: (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>,
  Sparkle: (p) => <Svg size={12} {...p}><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" /></Svg>,
  Arrow: (p) => <Svg size={14} stroke={2.5} {...p}><path d="M7 17 17 7M8 7h9v9" /></Svg>,
  Book: (p) => <Svg {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></Svg>,
  Route: (p) => <Svg {...p}><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></Svg>,
  Reset: (p) => <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>,
};

export const BUG_ICON_PATH =
  "m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3 3 0 1 1 6 0v1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4";
export const FEATURE_ICON_PATH =
  "m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z";

export function ZikiMark({ className = "h-7 w-auto" }) {
  return (
    <svg viewBox="0 0 28 32" fill="none" className={className} aria-hidden="true">
      <path d="M5 13h16L5 27.5h16" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 2.5 21 9h-9Z" fill="#38A3FF" stroke="#38A3FF" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Ziki's hammering icon: someone is working on it. */
export function HammeringIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="hammering h-3 w-3 shrink-0">
      <g className="hammering-head">
        <path d="m15 12-8.4 8.4a2.1 2.1 0 1 1-3-3L12 9" />
        <path d="M17.6 15 22 10.6M20.9 11.7 12.3 3.1a1 1 0 0 0-1.4 0L9.6 4.4a1 1 0 0 0 0 1.4l8.6 8.6a1 1 0 0 0 1.4 0l1.3-1.3a1 1 0 0 0 0-1.4Z" />
      </g>
    </svg>
  );
}

/* ---------- People and agents ---------- */

export function initialsOf(name) {
  const clean = (name ?? "").trim();
  if (!clean) return "?";
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : clean.slice(0, 2);
  return letters.toUpperCase();
}

const AVATAR_TONES = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-indigo-100 text-indigo-800",
  "bg-violet-100 text-violet-800",
  "bg-fuchsia-100 text-fuchsia-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-900",
  "bg-lime-100 text-lime-900",
];

function avatarTone(name) {
  const key = (name ?? "").trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return AVATAR_TONES[(hash >>> 0) % AVATAR_TONES.length];
}

const AVATAR_SIZES = { xs: "h-5 w-5 text-[9px]", sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" };

export function Avatar({ name, size = "sm", variant = "tone", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold ${AVATAR_SIZES[size]} ${
        variant === "solid" ? "bg-emerald-700 text-white" : avatarTone(name)
      } ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

const BODY_COLORS = ["#3978F6", "#7C5CE0", "#0E9F8E", "#E07A2E", "#D04F7A", "#4A5BD4"];
const LIGHT = { working: "#22C55E", waiting: "#F59E0B", idle: "#60A5FA", offline: "#94A3B8", paused: "#94A3B8" };

function colorFor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return BODY_COLORS[hash % BODY_COLORS.length];
}

/** Ziki's robot for an agent: its own body colour, an antenna light for its status. */
export function AgentGraphic({ name, status, size = 40 }) {
  const body = colorFor(name);
  const light = LIGHT[status] ?? LIGHT.idle;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="38" height="38" rx="12" fill={body} opacity="0.12" />
      <line x1="20" y1="7" x2="20" y2="12" stroke={body} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="6" r="2.6" fill={light} className={status === "working" ? "motion-safe:animate-pulse" : undefined} />
      <rect x="9" y="12" width="22" height="17" rx="6" fill={body} />
      <rect x="12.5" y="16" width="15" height="8.5" rx="4.25" fill="white" opacity="0.92" />
      <circle cx="17" cy="20.25" r="1.9" fill={body} />
      <circle cx="23" cy="20.25" r="1.9" fill={body} />
      <rect x="6.5" y="17" width="2.5" height="6" rx="1.25" fill={body} />
      <rect x="31" y="17" width="2.5" height="6" rx="1.25" fill={body} />
      <rect x="13" y="30" width="14" height="6" rx="3" fill={body} opacity="0.75" />
    </svg>
  );
}

export const STATUS_LABEL = {
  working: { label: "Working", tone: "bg-zk-ok-bg text-zk-ok-fg" },
  waiting: { label: "Waiting on you", tone: "bg-zk-warn-bg text-zk-warn-fg" },
  idle: { label: "Standing by", tone: "bg-zk-info-bg text-zk-info-fg" },
  offline: { label: "Offline", tone: "bg-zk-chip text-zk-muted" },
  paused: { label: "Paused", tone: "bg-zk-chip text-zk-muted" },
};

/** The status an agent shows: a pause wins over what it was doing. */
export function agentView(state, agent) {
  const live = state.agents[agent.id];
  if (live.paused) {
    const holds = agent.id === "claude" ? state.tasks.filter((n) => n === 812 || n === 815) : [];
    return {
      status: "paused",
      activity: holds.length ? `Paused by you. It keeps #${holds.join(" and #")} until the deadline.` : "Paused by you",
    };
  }
  return { status: live.status, activity: live.activity };
}

export function StatusChip({ status, className = "" }) {
  const meta = STATUS_LABEL[status] ?? STATUS_LABEL.idle;
  return <span className={`inline-flex rounded-full px-2 py-px text-[10.5px] font-semibold ${meta.tone} ${className}`}>{meta.label}</span>;
}

/* ---------- Consent stamps (new) ---------- */

const STAMP = {
  mandate: { tone: "border-zk-ok-fg/30 bg-zk-ok-bg text-zk-ok-fg", icon: Icon.Shield },
  explicit: { tone: "border-zk-info-fg/30 bg-zk-info-bg text-zk-info-fg", icon: Icon.User },
  none: { tone: "border-zk-warn-bd bg-zk-warn-bg text-zk-warn-fg", icon: Icon.Alert },
};

export function stampText(basis, owner = OWNER.first, you = false) {
  if (basis === "mandate") return you ? "Within your rules" : `Within ${owner}'s rules`;
  if (basis === "explicit") return you ? "Approved by you" : `Approved by ${owner}`;
  return "No owner approval";
}

/** Who stands behind an action: rules, a one-off approval, or nobody on record. */
export function Stamp({ basis, owner, you = false, detail, size = "sm" }) {
  const meta = STAMP[basis];
  const StampIcon = meta.icon;
  return (
    <span
      title={detail}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-bold ${meta.tone} ${
        size === "xs" ? "px-1.5 py-px text-[10.5px]" : "px-2 py-0.5 text-[11.5px]"
      }`}
    >
      <StampIcon />
      {stampText(basis, owner, you)}
    </span>
  );
}

/* ---------- Time ---------- */

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(timer);
  }, [interval]);
  return now;
}

export function relTime(at, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - at) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function mmss(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ---------- Dialogs and toasts ---------- */

export function Modal({ title, onClose, children, labelledBy = "modal-title", wide = false }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const first = panelRef.current?.querySelector("button, [href], input, select, textarea");
    first?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll("button:not([disabled]), [href], input, select, textarea")];
        if (items.length === 0) return;
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(11,23,51,0.45)] p-3 sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`max-h-[90dvh] w-full ${wide ? "max-w-2xl" : "max-w-lg"} overflow-y-auto rounded-[20px] border border-zk-border bg-zk-surface p-5 text-zk-text shadow-[0_24px_56px_rgba(11,23,51,0.22)] motion-safe:animate-[header-pop_140ms_ease-out] sm:p-6`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={labelledBy} className="text-lg font-extrabold tracking-[-0.01em] text-zk-text">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zk-chip text-zk-text hover:bg-zk-tint">
            <Icon.X />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function Toasts() {
  const { state, dispatch } = useStore();
  useEffect(() => {
    const timers = state.toasts.map((toast) => window.setTimeout(() => dispatch({ type: "dismissToast", id: toast.id }), 5200));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [state.toasts, dispatch]);
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-3 lg:bottom-6">
      {state.toasts.slice(-2).map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-lg items-start gap-2.5 rounded-xl border border-zk-border bg-zk-surface px-4 py-3 text-sm text-zk-text shadow-[0_16px_40px_rgba(11,23,51,0.18)] motion-safe:animate-[header-pop_160ms_ease-out]"
        >
          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${toast.tone === "info" ? "bg-electric-blue" : toast.tone === "warn" ? "bg-zk-warn-fg" : "bg-zk-ok-fg"}`} aria-hidden="true" />
          <span className="flex-1">{toast.text}</span>
          <button type="button" onClick={() => dispatch({ type: "dismissToast", id: toast.id })} aria-label="Dismiss" className="-mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-zk-muted hover:bg-zk-chip">
            <Icon.X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/** For links that point at parts of Ziki this prototype doesn't reproduce. */
export function useNotInPrototype() {
  const { dispatch } = useStore();
  return (event) => {
    event?.preventDefault?.();
    dispatch({ type: "toast", text: "That part of Ziki isn't in this prototype.", tone: "info" });
  };
}
