import { useEffect, useRef, useState } from "react";
import { AGENTS, LEVEL_LABEL, OWNER, WORKSPACE } from "./data.js";
import { pendingCount, useStore } from "./store.jsx";
import { A, Avatar, Icon, ZikiMark, initialsOf, linkFocus, navigate, useNotInPrototype } from "./ui.jsx";

const PAGE = "mx-auto w-full max-w-6xl px-4";

function useDismiss(open, close, containerRef) {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!containerRef.current?.contains(event.target)) close();
    };
    const onKey = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, containerRef]);
}

/** A thin bar above Ziki's header that says this is a prototype. */
export function PrototypeBar() {
  const { state, dispatch } = useStore();
  return (
    <div className="border-b border-zk-border bg-zk-tint text-zk-text">
      <div className={`${PAGE} flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-[12.5px] sm:px-6`}>
        <span className="rounded-full bg-electric-blue-strong px-2 py-px text-[11px] font-bold text-white">Prototype</span>
        <span className="min-w-0 text-zk-text2">
          <span className="font-semibold text-zk-text">Owner Mandates for Ziki.</span> UI only, with sample data. Nothing here touches the real Ziki.
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => dispatch({ type: "tourOpen", open: !state.tourOpen })}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-semibold text-zk-accent hover:bg-zk-surface ${linkFocus}`}
          >
            <Icon.Route size={14} /> Walkthrough
          </button>
          <A to="/proposal" className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-semibold text-zk-accent hover:bg-zk-surface ${linkFocus}`}>
            <Icon.Book size={14} /> Why this exists
          </A>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "reset" });
              navigate("/issues");
            }}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-semibold text-zk-text2 hover:bg-zk-surface hover:text-zk-text ${linkFocus}`}
          >
            <Icon.Reset size={14} /> Reset
          </button>
        </span>
      </div>
    </div>
  );
}

function NavIcon({ children }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  );
}

function TopNavLink({ to, active, label, children }) {
  return (
    <A
      to={to}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex shrink-0 items-center whitespace-nowrap font-medium ${linkFocus} max-lg:min-w-16 max-lg:flex-1 max-lg:flex-col max-lg:gap-0.5 max-lg:rounded-xl max-lg:py-1.5 max-lg:text-[11px] lg:h-9 lg:gap-2 lg:rounded-full lg:px-2.5 lg:text-[13px] ${
        active ? "text-zk-accent lg:bg-zk-tint" : "text-zk-text2 hover:text-zk-text lg:hover:bg-zk-chip"
      }`}
    >
      <span className={`relative flex items-center justify-center max-lg:h-7 max-lg:w-12 max-lg:rounded-full ${active ? "max-lg:bg-zk-tint" : ""}`}>{children}</span>
      {label}
    </A>
  );
}

function TopNav({ path }) {
  return (
    <nav
      aria-label="Workspace"
      className="flex items-center max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:justify-around max-lg:border-t max-lg:border-zk-border max-lg:bg-zk-surface max-lg:px-2 max-lg:pt-1.5 max-lg:pb-[max(0.375rem,env(safe-area-inset-bottom))] max-lg:shadow-[0_-1px_3px_rgba(0,0,0,0.04)] lg:gap-1"
    >
      <TopNavLink to="/issues" active={path.startsWith("/issues")} label="Product">
        <NavIcon>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </NavIcon>
      </TopNavLink>
      <TopNavLink to="/marketing" active={path.startsWith("/marketing")} label="Marketing">
        <NavIcon>
          <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </NavIcon>
      </TopNavLink>
      <TopNavLink to="/security" active={path.startsWith("/security")} label="Security">
        <NavIcon>
          <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </NavIcon>
      </TopNavLink>
    </nav>
  );
}

function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const notHere = useNotInPrototype();
  useDismiss(open, () => setOpen(false), ref);
  return (
    <div ref={ref} className="relative min-w-0 max-sm:max-w-44">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-[30px] max-w-full items-center gap-2 rounded-full border border-transparent bg-transparent py-0 pl-1.5 pr-2.5 text-[13px] font-medium text-zk-text hover:bg-zk-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-tint focus-visible:ring-offset-2 max-sm:pl-0 max-sm:text-base max-sm:font-semibold"
      >
        <span className="sr-only">Active workspace, </span>
        <span className="truncate">{WORKSPACE}</span>
        <svg className="h-3.5 w-3.5 shrink-0 text-zk-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 rounded-2xl border border-zk-border bg-zk-surface p-1.5 shadow-[0_16px_40px_rgba(11,23,51,0.16)]">
          <ul role="listbox" aria-label="Workspaces">
            <li role="presentation">
              <button type="button" role="option" aria-selected="true" onClick={() => setOpen(false)} className="block w-full truncate rounded-md bg-zk-tint px-2 py-1.5 text-left text-sm font-medium text-zk-accent">
                {WORKSPACE}
              </button>
            </li>
          </ul>
          <div className="mt-1 border-t border-zk-divider pt-1">
            <a href="#" onClick={notHere} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-zk-accent hover:bg-zk-chip">
              <Icon.Plus size={14} /> Add organisation
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AgentsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const notHere = useNotInPrototype();
  useDismiss(open, () => setOpen(false), ref);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title="Agents"
        className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-3.5 text-[13px] font-medium text-zk-text hover:bg-zk-chip max-sm:h-9 max-sm:w-9 max-sm:border-0 max-sm:bg-transparent max-sm:px-0 ${linkFocus}`}
      >
        <span className="text-electric-blue max-sm:text-zk-text">
          <Icon.Agent />
        </span>
        <span className="max-sm:sr-only">Agents</span>
        <Icon.ChevronDown className="max-sm:hidden" />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-12 z-50 flex w-[260px] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-2xl border border-zk-border bg-zk-surface p-2 shadow-[0_16px_40px_rgba(11,23,51,0.16)]">
          <span className="px-2.5 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-[0.06em] text-zk-muted">Project agents</span>
          {AGENTS.map((agent) => (
            <A key={agent.id} to={`/settings/agents/${agent.id}/rules`} onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5 text-left text-zk-text hover:bg-zk-chip">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-zk-tint text-xs font-extrabold text-zk-accent">{initialsOf(agent.name)}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{agent.name}</span>
              <span className="rounded-full bg-zk-info-bg px-2 py-0.5 text-[11px] font-bold text-zk-info-fg">{LEVEL_LABEL[agent.level]}</span>
            </A>
          ))}
          <div className="my-1 h-px bg-zk-divider" />
          <a href="#" onClick={notHere} className="flex min-h-11 items-center gap-2 rounded-[10px] px-2.5 font-bold text-zk-accent hover:bg-zk-chip">
            <Icon.Plus /> Create agent
          </a>
          <a href="#" onClick={notHere} className="flex min-h-10 items-center rounded-[10px] px-2.5 font-semibold text-zk-text2 hover:bg-zk-chip">Get started</a>
          <A to="/settings/agents" onClick={() => setOpen(false)} className="flex min-h-10 items-center rounded-[10px] px-2.5 font-semibold text-zk-text2 hover:bg-zk-chip">Manage agents</A>
        </div>
      ) : null}
    </div>
  );
}

const THEMES = [
  ["system", "System"],
  ["light", "Light"],
  ["dark", "Dark"],
];

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
}

function ThemeSelector() {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem("zm-theme") || "system";
    } catch {
      return "system";
    }
  });
  const choose = (value) => {
    setTheme(value);
    applyTheme(value);
    try {
      window.localStorage.setItem("zm-theme", value);
    } catch {
      // Not saved; the choice still applies until reload.
    }
  };
  return (
    <div className="flex flex-col gap-2 px-3 py-2.5" role="group" aria-label="Theme preference">
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Theme</span>
      <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-zk-seg p-1">
        {THEMES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={theme === value}
            className={`inline-flex h-9 items-center justify-center rounded-lg text-xs font-semibold ${theme === value ? "bg-zk-surface text-zk-text" : "text-zk-text2 hover:text-zk-text"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuLink({ to, onClick, active = false, children }) {
  const className = `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${linkFocus} ${active ? "bg-zk-tint text-zk-accent" : "text-zk-text hover:bg-zk-chip"}`;
  if (to) {
    return (
      <A to={to} onClick={onClick} className={className}>
        {children}
      </A>
    );
  }
  return (
    <a href="#" onClick={onClick} className={className}>
      {children}
    </a>
  );
}

function AccountMenu({ path }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const notHere = useNotInPrototype();
  useDismiss(open, () => setOpen(false), ref);
  const pending = pendingCount(state);
  const close = () => setOpen(false);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-11 max-w-full items-center gap-2 rounded-full border border-zk-border bg-zk-surface py-[5px] pl-[5px] pr-3 text-zk-text hover:bg-zk-chip ${linkFocus}`}
      >
        <span className="sr-only">Account menu for </span>
        <Avatar name={OWNER.name} size="md" variant="solid" />
        <span className="max-w-40 truncate text-[13px] font-medium max-sm:sr-only">{OWNER.name}</span>
        <Icon.ChevronDown size={12} className="shrink-0 text-zk-muted max-sm:hidden" />
      </button>
      {open ? (
        <div role="menu" aria-label="Account" className="absolute right-0 top-[54px] z-50 flex w-[300px] max-w-[calc(100vw-2rem)] origin-top-right flex-col gap-1 rounded-[20px] border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)] motion-safe:animate-[header-pop_120ms_ease-out]">
          <div className="flex items-center gap-3 rounded-[14px] bg-zk-tint p-3">
            <Avatar name={OWNER.name} size="lg" variant="solid" />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-zk-text">{OWNER.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-full bg-zk-surface px-2 py-0.5 font-bold text-zk-text2">Member</span>
              </p>
            </div>
          </div>
          <MenuLink onClick={notHere}>Profile</MenuLink>
          <ThemeSelector />
          <div className="mx-2 h-px bg-zk-divider" />
          <MenuLink onClick={notHere}>Activity &amp; Approvals</MenuLink>
          <MenuLink to="/issues" onClick={close} active={path === "/issues"}>
            <span className="flex-1">Escalations</span>
            {pending > 0 ? <span className="rounded-full bg-zk-bad-soft px-2 py-0.5 text-xs font-bold tabular-nums text-zk-bad-fg">{pending}</span> : null}
          </MenuLink>
          <MenuLink to="/settings/agents" onClick={close} active={path.startsWith("/settings")}>Settings</MenuLink>
          <MenuLink to="/proposal" onClick={close} active={path === "/proposal"}>Documentation</MenuLink>
          <MenuLink onClick={notHere}>Report issue</MenuLink>
          <div className="mx-2 h-px bg-zk-divider" />
          <a href="#" onClick={notHere} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-zk-bad-fg hover:bg-zk-bad-soft ${linkFocus}`}>Sign out</a>
        </div>
      ) : null}
    </div>
  );
}

function PointsLink() {
  const notHere = useNotInPrototype();
  return (
    <a href="#" onClick={notHere} title="Ranking" className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-zk-warn-bg px-2.5 text-[12.5px] font-semibold text-zk-warn-fg hover:brightness-95 ${linkFocus}`}>
      <Icon.Trophy />
      <span className="tabular-nums">1,110</span> pts
      <span className="sr-only"> of 500. Open Ranking</span>
    </a>
  );
}

function NotificationsBell() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, () => setOpen(false), ref);
  const items = [
    ...state.decisions.filter((d) => d.status === "pending").map((d) => ({
      id: d.id,
      title: d.kind === "findwork" ? "Ada's Scout found work and needs your decision" : `${AGENTS.find((a) => a.id === d.agent).name} needs your decision on #${d.issue}`,
    })),
    ...state.questions.filter((q) => q.status === "pending").map((q) => ({ id: q.id, title: `${AGENTS.find((a) => a.id === q.agent).name} asked about #${q.issue}` })),
  ];
  const unread = items.length;
  return (
    <div ref={ref} className="flex items-center sm:relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-zk-text hover:bg-zk-chip ${linkFocus}`}
      >
        <Icon.Bell />
        {unread > 0 ? (
          <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-zk-surface bg-electric-blue-strong px-1 text-[11px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div role="region" aria-label="Recent notifications" className="absolute right-4 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-zk-border bg-zk-surface text-zk-text shadow-xl sm:right-0">
          <h2 className="border-b border-zk-border px-4 py-3 text-sm font-semibold">Notifications</h2>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-zk-muted">Nothing needs you. Your agents are working inside your rules.</p>
          ) : (
            <ul className="divide-y divide-zk-divider">
              {items.map((item) => (
                <li key={item.id}>
                  <A to="/issues" onClick={() => setOpen(false)} className="flex items-start gap-3 bg-zk-tint px-4 py-3 text-sm hover:bg-zk-chip">
                    <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-electric-blue" />
                    <span className="min-w-0 flex-1 font-medium text-zk-text">{item.title}</span>
                  </A>
                </li>
              ))}
            </ul>
          )}
          <A to="/issues" onClick={() => setOpen(false)} className="block border-t border-zk-border px-4 py-3 text-sm font-medium text-zk-accent hover:bg-zk-chip">Open the Inbox</A>
        </div>
      ) : null}
    </div>
  );
}

export function AppHeader({ path }) {
  return (
    <header className="relative z-40 border-b border-zk-border bg-zk-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:sticky lg:top-0">
      <div className={`${PAGE} flex flex-wrap items-center gap-x-3 gap-y-2 py-3 max-sm:py-2 sm:px-6`}>
        <div className="flex min-w-0 items-center gap-2">
          <A to="/dashboard" aria-label="Ziki" className={`flex shrink-0 items-center gap-2 rounded-full ${linkFocus}`}>
            <ZikiMark className="h-7 w-auto text-electric-blue-strong max-sm:h-6" />
            <span aria-hidden="true" className="pr-1 text-[15px] font-semibold tracking-[-0.02em] text-zk-text max-sm:hidden">ziki</span>
          </A>
          <span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-zk-border max-sm:hidden" />
          <WorkspaceSwitcher />
        </div>
        <TopNav path={path} />
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 max-sm:gap-1 lg:shrink-0">
          <AgentsMenu />
          <AccountMenu path={path} />
          <PointsLink />
          <NotificationsBell />
        </div>
      </div>
    </header>
  );
}
