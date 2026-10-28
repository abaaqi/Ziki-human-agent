import { useEffect, useState } from "react";
import {
  AGENTS,
  ISSUES,
  MAX_TASKS,
  OWNER,
  SEV_LABEL,
  SOLVER_POINTS,
  WORKSPACE,
  agentById,
  covers,
  formatDate,
  issueByNumber,
  reasonsOutside,
  ruleChanges,
  ruleSentence,
  forbid,
  widen,
  neverLabel,
} from "../data.js";
import { actOf, effectiveRules, pendingCount, useStore } from "../store.jsx";
import {
  A,
  AgentGraphic,
  Avatar,
  BUG_ICON_PATH,
  FEATURE_ICON_PATH,
  HammeringIcon,
  Icon,
  Modal,
  Stamp,
  StatusChip,
  agentView,
  chipBase,
  linkFocus,
  mmss,
  relTime,
  severityChip,
  smallGhost,
  smallPrimary,
  smallSecondary,
  useNotInPrototype,
  useNow,
} from "../ui.jsx";

/* ---------- Ziki's issue rows ---------- */

function IssueRowStatus({ issue }) {
  if (issue.status === "resolved" || issue.status === "closed") {
    return (
      <span className={`issue-row-status inline-flex items-center gap-1 ${issue.status === "resolved" ? "text-zk-ok-fg" : "text-zk-muted"}`}>
        <Icon.Check size={12} /> {issue.status === "resolved" ? "Resolved" : "Closed"}
      </span>
    );
  }
  if (issue.worker) {
    return (
      <span className="issue-row-status inline-flex min-w-0 flex-col items-start gap-0.5">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="text-zk-ok-fg"><HammeringIcon /></span>
          <span className="max-w-[7rem] truncate text-zk-text2">{issue.worker}</span>
          {issue.basis ? (
            <span
              title={issue.basis === "mandate" ? `Within ${issue.worker.split(" ")[0]}'s rules` : `Approved by ${issue.worker.split(" ")[0]}`}
              className={issue.basis === "mandate" ? "text-zk-ok-fg" : "text-zk-info-fg"}
            >
              {issue.basis === "mandate" ? <Icon.Shield /> : <Icon.User />}
              <span className="sr-only">{issue.basis === "mandate" ? "Within the owner's rules" : "Approved by the owner"}</span>
            </span>
          ) : null}
        </span>
        <span className="inline-flex items-center gap-0.5 pl-5 text-[10.5px] tabular-nums text-zk-muted">
          <Icon.Clock size={10} /> {issue.sinceMin} min
        </span>
      </span>
    );
  }
  if (issue.stage === "ready") {
    return (
      <span className="issue-row-status inline-flex items-center gap-1 text-zk-ok-fg">
        <Icon.Bid /> Ready for bids
      </span>
    );
  }
  if (issue.stage === "confirmed") {
    return (
      <span className="issue-row-status inline-flex items-center gap-1 text-zk-text2" title={`Confirmed by ${issue.bots} bots; ${Math.min(issue.votes, 3)} of 3 upvotes to be ready for bids`}>
        <span className="text-zk-accent"><Icon.Bot /></span>
        <span>
          Confirming… <span className="tabular-nums">({Math.min(issue.votes, 3)}/3)</span>
        </span>
      </span>
    );
  }
  if (issue.stage === "reported") {
    return (
      <span className="issue-row-status inline-flex items-center gap-1 text-zk-text2">
        <span className="text-amber-400"><Icon.Bulb /></span> Idea
      </span>
    );
  }
  return <span className="issue-row-status inline-flex items-center gap-1 text-zk-text2">Open</span>;
}

export function IssueTable({ issues }) {
  return (
    <div className="issues-table relative">
      <div className="issues-table-heading">
        <span className="w-[52px]">Votes</span>
        <span className="min-w-0 flex-1">Issue</span>
        <span className="issues-status-cell">Status</span>
        <span className="issues-priority">Priority</span>
        <span className="w-10" aria-hidden="true" />
      </div>
      <ul>
        {issues.map((issue, index) => {
          const isFeature = /improve|feature/i.test(issue.type);
          return (
            <li key={issue.n} data-severity={issue.sev} className={`issues-row flex items-center gap-2 px-2 py-3.5 lg:gap-4 lg:px-4 ${index < issues.length - 1 ? "border-b border-zk-divider" : ""}`}>
              <div className="issues-vote w-[52px] shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <button type="button" aria-pressed="false" aria-label={`${issue.votes} upvotes`} className="group inline-flex min-w-[2.75rem] flex-col items-center justify-center rounded-lg border border-zk-border bg-zk-surface px-2 py-1 text-xs font-semibold text-zk-text">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
                    <span className="mt-0.5 tabular-nums leading-tight">{issue.votes}</span>
                  </button>
                </div>
              </div>
              <A to={`/issues/${issue.n}`} data-issue-link="" className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-blue">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={`issues-row-title text-sm font-semibold leading-snug ${issue.status === "resolved" ? "text-zk-muted" : "text-zk-text"}`}>{issue.title}</span>
                  <span className="issues-row-meta flex items-center gap-2 text-xs text-zk-muted">
                    <span className="font-mono tabular-nums">#{issue.n}</span>
                    <span className="inline-flex items-center" title={issue.type}>
                      <span className="sr-only">{issue.type}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={isFeature ? FEATURE_ICON_PATH : BUG_ICON_PATH} /></svg>
                    </span>
                    {issue.comments > 0 ? (
                      <span className="inline-flex items-center gap-1" title={`Conversation: ${issue.comments}`}>
                        <Icon.Comment /> {issue.comments}
                      </span>
                    ) : null}
                    <span>{issue.area}</span>
                    <span>{issue.age}</span>
                    <span className="inline-flex min-w-0 md:sr-only"><IssueRowStatus issue={issue} /></span>
                  </span>
                </span>
              </A>
              <span className="issues-status-cell" aria-hidden="true"><IssueRowStatus issue={issue} /></span>
              <span className="issues-priority" title={`${SEV_LABEL[issue.sev]} priority`}>
                <span className="sr-only">{SEV_LABEL[issue.sev]} priority</span>
                <span className="issues-priority-bars" aria-hidden="true">
                  {[0, 1, 2].map((bar) => <i key={bar} data-active={bar < { low: 1, medium: 2, high: 3, critical: 3 }[issue.sev]} />)}
                </span>
              </span>
              <span className="hidden w-10 shrink-0 items-center justify-end gap-2 lg:flex">
                {issue.worker ? <Avatar name={issue.worker} size="sm" /> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- The Issues heading and tabs, as in Ziki ---------- */

function IssuesHeading() {
  const notHere = useNotInPrototype();
  return (
    <div className="issues-heading flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="issues-breadcrumb flex min-w-0 flex-wrap items-center gap-2">
          <A to="/dashboard" className="truncate text-zk-text2 hover:text-zk-text">{WORKSPACE}</A>
          <Icon.ChevronRight className="shrink-0 text-zk-muted" />
          <h1 aria-current="page" className="text-zk-text">Issues</h1>
        </nav>
      </div>
      <div className="issues-filters space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <div className="issues-search min-w-0 max-w-xs flex-1 basis-[240px]">
            <div className="relative" data-testid="search-box">
              <div className="flex h-[42px] items-center gap-2 rounded-full border border-zk-border bg-zk-surface px-4">
                <Icon.Search className="shrink-0 text-zk-muted" />
                <button type="button" className="issues-search-trigger" aria-label="Search issues" title="Search issues" onClick={notHere} />
                <input aria-label="Search" placeholder="Search issues…" className="bg-transparent text-sm outline-none" readOnly />
              </div>
            </div>
          </div>
          <button type="button" onClick={notHere} aria-label="Filter" className="issues-filter-trigger inline-flex h-[42px] items-center gap-2 rounded-full border border-zk-border bg-zk-surface px-4 text-sm font-bold text-zk-text hover:bg-zk-chip">
            <Icon.Filter className="h-4 w-4" />
            <span>Filter</span>
            <Icon.ChevronDown />
          </button>
          <div className="issues-sort">
            <button type="button" className="issues-sort-trigger" aria-label="Sort issues" title="Sort: Most upvoted" onClick={notHere}>
              <img src="/icons/issues-sort.svg" width="16" height="16" alt="" />
            </button>
          </div>
          <a href="#" onClick={notHere} title="New issue" className="issues-new inline-flex w-8 items-center justify-center rounded-lg border border-zk-border bg-zk-surface text-zk-text hover:bg-zk-chip max-md:hidden">
            <Icon.Plus size={14} />
            <span className="sr-only">New issue</span>
          </a>
          <button type="button" onClick={notHere} title="Platform: All" className="relative inline-flex h-8 items-center gap-2 rounded-lg border border-zk-border bg-zk-surface text-[13px] font-medium text-zk-text hover:bg-zk-chip max-sm:w-8 max-sm:justify-center sm:px-3">
            <Icon.Monitor className="shrink-0" />
            <span className="max-sm:sr-only">
              Platform: <span className="font-semibold">All</span>
            </span>
            <span className="rounded-full bg-zk-chip px-1.5 font-mono text-xs tabular-nums text-zk-muted max-sm:hidden">{ISSUES.length}</span>
            <Icon.ChevronDown size={12} className="text-zk-muted max-sm:hidden" />
          </button>
        </div>
      </div>
      <div className="issues-actions flex flex-wrap items-center gap-2 print:hidden">
        <a href="#" onClick={notHere} title="New issue" className="issues-new inline-flex w-8 items-center justify-center rounded-lg border border-zk-border bg-zk-surface text-zk-text hover:bg-zk-chip md:hidden">
          <Icon.Plus size={14} />
          <span className="sr-only">New issue</span>
        </a>
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Done" },
  { value: "ready_to_merge", label: "Ready to Merge" },
  { value: "auto_merge", label: "Auto Merge" },
  { value: "all", label: "All" },
];

function statusCount(value) {
  if (value === "all") return ISSUES.length;
  if (value === "ready_to_merge" || value === "auto_merge") return 0;
  return ISSUES.filter((issue) => issue.status === value).length;
}

function TabsRow({ status, inboxActive, count }) {
  const notHere = useNotInPrototype();
  return (
    <div className="issues-tabs-row flex items-center gap-2.5">
      <A
        to="/issues"
        aria-current={inboxActive ? "page" : undefined}
        className={`inline-flex h-[42px] shrink-0 items-center gap-2 rounded-[10px] border px-3 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zk-accent max-sm:h-9 ${
          inboxActive ? "border-electric-blue-strong bg-electric-blue-strong text-white" : "border-zk-divider bg-zk-chip text-zk-text hover:bg-zk-surface"
        }`}
      >
        <Icon.Inbox />
        Inbox
        <span className={`min-w-5 rounded-full px-1.5 text-center font-mono text-[11px] font-normal tabular-nums ${count > 0 ? "bg-zk-bad-bg text-zk-bad-fg" : inboxActive ? "bg-white/25 text-white" : "text-zk-muted"}`}>{count}</span>
      </A>
      <a href="#" onClick={notHere} aria-label="Merge history" title="Merge history" className="inline-flex h-[42px] shrink-0 items-center gap-2 rounded-[10px] border border-zk-divider bg-zk-chip px-3 text-[13px] font-semibold text-zk-text hover:bg-zk-surface max-sm:h-9">
        <Icon.Merge />
      </a>
      <nav aria-label="Issue status" className="issues-status-nav ml-auto min-w-0">
        <ul>
          {STATUS_TABS.map(({ value, label }) => (
            <li key={value}>
              <A to={`/issues?status=${value}`} aria-current={status === value ? "page" : undefined}>
                <span className={`issues-status-dot issues-status-${value}`} aria-hidden="true" />
                {label}
                <span className="issues-status-count">{statusCount(value)}</span>
              </A>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/* ---------- Your agents, in the Inbox's top box ---------- */

function usageLine(state, agent) {
  const rules = state.rules[agent.id];
  if (!rules) return null;
  if (agent.level === "contributor") {
    const sessionBids = state.digest.filter((g) => g.agent === agent.id && /^(Bid on|Queued a bid)/.test(g.text) && !/^g\d$/.test(g.id)).length;
    const bids = (agent.id === "claude" ? 1 : 0) + sessionBids;
    return `${Math.min(bids, rules.limits.bid)} of ${rules.limits.bid} bids today · ${state.tasks.length} of ${MAX_TASKS} tasks in use`;
  }
  if (agent.level === "reviewer") return `6 of ${rules.limits.review} reviews today`;
  return `4 of ${rules.limits.triage} checks today`;
}

function InboxAgents({ focus }) {
  const { state, dispatch } = useStore();
  const order = { waiting: 0, working: 1, idle: 2, paused: 3, offline: 4 };
  // The order is set once, so an agent doesn't jump away when its status changes.
  const [agents] = useState(() => [...AGENTS].sort((a, b) => order[agentView(state, a).status] - order[agentView(state, b).status]));
  const [selected, setSelected] = useState(focus && agentById(focus) ? focus : agents[0].id);
  useEffect(() => {
    if (focus && agentById(focus)) setSelected(focus);
  }, [focus]);
  const agent = agents.find((each) => each.id === selected) ?? agents[0];
  const view = agentView(state, agent);
  const rules = state.rules[agent.id];
  const running = view.status === "working" || view.status === "waiting";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2.5" aria-live="polite">
        <AgentGraphic name={agent.name} status={view.status} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-zk-text">{agent.name}</span>
            <button
              type="button"
              onClick={() => dispatch({ type: running && view.status !== "paused" ? "stop" : "work", id: agent.id })}
              disabled={state.scoutSearch === "searching" && agent.id === "scout"}
              className={`ml-auto inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold disabled:opacity-60 ${linkFocus} ${
                running && view.status !== "paused" ? "border-zk-border text-zk-text2 hover:bg-zk-chip" : "border-electric-blue-strong bg-electric-blue-strong text-white hover:bg-[#2552af]"
              }`}
            >
              {running && view.status !== "paused" ? (
                <>
                  <Icon.Pause size={10} /> Stop work
                </>
              ) : (
                <>
                  <Icon.Play size={10} /> Work
                </>
              )}
            </button>
            <A
              to={`/settings/agents/${agent.id}/rules`}
              aria-label={`Rules for ${agent.name}`}
              title={`Rules for ${agent.name}`}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zk-muted hover:bg-zk-chip hover:text-zk-text focus-visible:outline-2 focus-visible:outline-zk-accent"
            >
              <Icon.Gear />
            </A>
          </div>
          <StatusChip status={view.status} className="mt-0.5" />
          <p className="mt-1 truncate text-xs text-zk-text2" title={view.activity}>{view.activity}</p>
          <A to={`/settings/agents/${agent.id}/rules`} className="mt-1 flex items-center gap-1 truncate text-[11.5px] font-semibold text-zk-accent hover:underline">
            <Icon.Shield /> {rules ? `Rules: ${rules.name}` : "No rules yet: set them"}
          </A>
          {rules ? <p className="truncate text-[11px] text-zk-muted">{usageLine(state, agent)}</p> : <p className="truncate text-[11px] text-zk-muted">{agent.done}</p>}
        </div>
      </div>
      <div className="flex justify-center gap-1.5" role="group" aria-label="Choose an agent">
        {agents.map((each) => (
          <button key={each.id} type="button" aria-label={`Show ${each.name}`} aria-current={each.id === agent.id ? "true" : undefined} onClick={() => setSelected(each.id)} className="group flex h-5 items-center px-0.5 focus-visible:outline-2 focus-visible:outline-zk-accent">
            <span className={`block h-1.5 rounded-full motion-safe:transition-all ${each.id === agent.id ? "w-4 bg-electric-blue-strong" : "w-1.5 bg-zk-border group-hover:bg-zk-muted"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HowTheInboxWorks({ focus }) {
  const { state, dispatch } = useStore();
  const allPaused = AGENTS.every((agent) => state.agents[agent.id].paused);
  return (
    <section aria-label="How the Inbox works" className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[14px] border border-zk-border bg-zk-surface md:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zk-tint text-zk-accent" aria-hidden="true">
          <Icon.Inbox size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zk-text">How the Inbox works</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-zk-text2">
            Your agents work on their own inside the rules you give them. They stop here only when something falls outside those rules, and they tell you what they found, what they would do and what it would commit you to.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-zk-muted">
            <span className="inline-flex items-center gap-1.5"><Stamp basis="mandate" you size="xs" /> they acted on their own</span>
            <span className="inline-flex items-center gap-1.5"><Stamp basis="explicit" you size="xs" /> you said yes once</span>
          </p>
        </div>
      </div>
      <div aria-label="Your agents" role="group" className="flex flex-col gap-2 border-zk-divider p-3 max-md:border-t md:border-l">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Your agents</h2>
          <button
            type="button"
            onClick={() => dispatch({ type: allPaused ? "resumeAll" : "pauseAll" })}
            className={`inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold ${linkFocus} ${allPaused ? "border-electric-blue-strong text-zk-accent hover:bg-zk-tint" : "border-zk-border text-zk-text2 hover:bg-zk-chip"}`}
          >
            {allPaused ? <><Icon.Play size={10} /> Resume all</> : <><Icon.Pause size={10} /> Pause all</>}
          </button>
        </div>
        <InboxAgents focus={focus} />
      </div>
    </section>
  );
}

const INBOX_TABS = [
  { view: "input", label: "Need your input" },
  { view: "design", label: "Design feedback needed" },
  { view: "ideas", label: "New ideas" },
  { view: "drafts", label: "Drafted ideas" },
  { view: "done", label: "Done under your rules" },
];

/* ---------- Decision cards ---------- */

const KIND = {
  accept: { chip: "Take an offer", verb: "wants to accept an offer" },
  bid: { chip: "Bid", verb: "wants to bid" },
  extend: { chip: "More time", verb: "asks for more time" },
  findwork: { chip: "Found work", verb: "looked for work and found 3 issues it could take" },
};

function commitments(state, decision, issue) {
  const slots = state.tasks.length;
  const slotLine =
    slots >= MAX_TASKS
      ? `You already hold ${MAX_TASKS} of ${MAX_TASKS} tasks, so Ziki holds this until one is delivered`
      : slots === MAX_TASKS - 1
        ? `Your last free task slot (${slots} of ${MAX_TASKS} in use)`
        : `One of your ${MAX_TASKS} task slots`;
  const push = "You push the branch: I can't push to Zedu-Endor";
  const points = issue ? `${SOLVER_POINTS[issue.sev].toLocaleString()} points to you if the fix merges` : null;
  if (decision.kind === "accept") return ["A fix due 60 minutes after you approve, in your name", slotLine, push, points];
  if (decision.kind === "bid") return ["Nothing is reserved until the reporter awards it", `If awarded: a fix due 60 minutes later, and ${slots >= MAX_TASKS ? "a task slot you don't have free" : "one of your task slots"}`, push, points];
  if (decision.kind === "extend") return ["The deadline moves 60 minutes later", "This task's only extension: there is no second one", "If CI still hasn't reported by then, the task is released"];
  return [];
}

function TimerPill({ decision, now }) {
  if (decision.kind === "accept") {
    const left = decision.holdUntil - now;
    return (
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums max-sm:ml-12 ${left > 0 ? "bg-zk-warn-bg text-zk-warn-fg" : "bg-zk-chip text-zk-muted"}`} title="Ziki holds the offer for you while you decide">
        <Icon.Clock /> {left > 0 ? `Held for you · ${mmss(left)}` : "Offer moved on"}
      </span>
    );
  }
  if (decision.kind === "extend") {
    const left = decision.deadline - now;
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zk-bad-bg px-2.5 py-1 text-xs font-bold tabular-nums text-zk-bad-fg max-sm:ml-12" title="Time left before the fix is due">
        <Icon.Clock /> Due in {mmss(left)}
      </span>
    );
  }
  if (decision.kind === "bid") {
    return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zk-chip px-2.5 py-1 text-xs font-semibold text-zk-text2 max-sm:ml-12">No clock: nothing is reserved</span>;
  }
  return null;
}

function RuleChangeDialog({ decision, option, mode, onClose }) {
  const { state, dispatch } = useStore();
  const agent = agentById(decision.agent);
  const before = state.rules[decision.agent];
  const act = actOf(decision, option);
  const after = mode === "never" ? forbid(agent, before, act) : widen(agent, before, act);
  const changes = ruleChanges(before, after);
  const alsoCovered =
    mode === "allow"
      ? state.decisions.filter(
          (d) => d.id !== decision.id && d.agent === decision.agent && d.status === "pending" && d.kind !== "findwork" && covers({ ...after, paused: state.agents[decision.agent].paused }, actOf(d)),
        )
      : [];
  return (
    <Modal title={mode === "never" ? `Never allow this for ${agent.name}?` : `Change ${agent.name}'s rules?`} onClose={onClose} wide>
      <p className="text-sm text-zk-text2">
        {mode === "never"
          ? "This adds a \"never\" rule. The agent won't ask about this kind of work again, and Ziki refuses it if it tries."
          : "This is the smallest change that covers this request. From now on, work like this goes ahead without asking you, and shows up under Done under your rules."}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {changes.map((change) => (
          <li key={change} className={`${chipBase} ${mode === "never" ? "bg-zk-bad-bg text-zk-bad-fg" : "bg-zk-tint text-zk-accent"}`}>
            {mode === "never" ? <Icon.X size={12} /> : <Icon.Plus size={12} />} {change}
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2">
        <div className="rounded-[14px] border border-zk-border bg-zk-bg p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-zk-muted">Now</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zk-text2">{ruleSentence(agent, before)}</p>
        </div>
        <div className={`rounded-[14px] border p-3.5 ${mode === "never" ? "border-zk-bad-bd bg-zk-bad-soft" : "border-electric-blue-strong bg-zk-tint"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.06em] ${mode === "never" ? "text-zk-bad-fg" : "text-zk-accent"}`}>After</p>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-zk-text">{ruleSentence(agent, after)}</p>
        </div>
      </div>
      {alsoCovered.length > 0 ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-zk-ok-bg px-3 py-2.5 text-[13px] text-zk-ok-fg">
          <Icon.Check size={14} className="mt-0.5 shrink-0" />
          <span>
            It also covers {alsoCovered.length === 1 ? "one other request" : `${alsoCovered.length} other requests`} waiting for you:{" "}
            {alsoCovered.map((d) => `#${d.issue} (${KIND[d.kind].chip.toLowerCase()})`).join(", ")}. {alsoCovered.length === 1 ? "That goes" : "Those go"} ahead too.
          </span>
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className={smallSecondary} onClick={onClose}>Cancel</button>
        <button
          type="button"
          className={mode === "never" ? "inline-flex h-9 items-center justify-center rounded-full bg-zk-bad-fg px-3.5 text-[13px] font-bold text-white hover:opacity-90" : smallPrimary}
          onClick={() => {
            dispatch({ type: mode === "never" ? "never" : "alwaysAllow", id: decision.id, option });
            onClose();
          }}
        >
          {mode === "never" ? "Add the never rule" : option ? "Change rules and take it" : "Change rules and approve"}
        </button>
      </div>
    </Modal>
  );
}

function ResolvedCard({ decision, now }) {
  const agent = agentById(decision.agent);
  const tone =
    decision.status === "declined" || decision.status === "never"
      ? "text-zk-muted"
      : decision.status === "rule" || decision.status === "covered"
        ? "text-zk-ok-fg"
        : "text-zk-info-fg";
  const basis = decision.status === "rule" || decision.status === "covered" ? "mandate" : decision.status === "approved" ? "explicit" : null;
  const subject = decision.kind === "findwork" ? (decision.option ? `#${decision.option}` : "the work it found") : `#${decision.issue}`;
  return (
    <article className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[14px] border border-zk-divider bg-zk-bg px-4 py-3">
      <AgentGraphic name={agent.name} status="idle" size={28} />
      <p className="min-w-0 flex-1 text-[13px] text-zk-text2">
        <span className={`font-semibold ${tone}`}>{decision.status === "covered" ? "Went ahead" : decision.status === "rule" ? "Allowed from now on" : decision.status === "approved" ? "Approved once" : decision.status === "never" ? "Never allowed" : decision.kind === "findwork" ? "Not now" : "Not this one"}</span>
        <span className="text-zk-muted"> · {agent.name} · {subject} · {relTime(decision.resolvedAt, now)}</span>
        <span className="block text-zk-text2">{decision.outcome}</span>
      </p>
      {basis ? <Stamp basis={basis} you size="xs" /> : null}
    </article>
  );
}

function DecisionCard({ decision, now }) {
  const { state, dispatch } = useStore();
  const [dialog, setDialog] = useState(null);
  const agent = agentById(decision.agent);
  if (decision.status !== "pending") return <ResolvedCard decision={decision} now={now} />;
  if (decision.kind === "findwork") return <FindWorkCard decision={decision} now={now} />;
  const issue = issueByNumber(decision.issue);
  const rules = effectiveRules(state, decision.agent);
  const reasons = reasonsOutside(rules, actOf(decision));
  const lines = commitments(state, decision, issue).filter(Boolean);
  const expired = decision.kind === "accept" && decision.holdUntil <= now;
  const slotsFull = decision.kind === "accept" && state.tasks.length >= MAX_TASKS;
  return (
    <article className={`rounded-[14px] border bg-zk-surface p-4 sm:p-5 ${expired ? "border-zk-divider opacity-70" : "border-zk-border"}`} aria-label={`${agent.name}: ${KIND[decision.kind].chip}, #${decision.issue}`}>
      <div className="flex flex-wrap items-start gap-3">
        <AgentGraphic name={agent.name} status="waiting" size={36} />
        <div className="min-w-0 flex-1 basis-[220px]">
          <p className="text-[13px] text-zk-text2">
            <span className="font-semibold text-zk-text">{agent.name}</span> {KIND[decision.kind].verb} <span className="text-zk-muted">· {relTime(decision.created, now)}</span>
          </p>
          <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-zk-text">
            <A to={`/issues/${decision.issue}`} className="hover:underline">
              <span className="font-bold tabular-nums text-zk-muted">#{decision.issue}</span> {issue.title}
            </A>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`${chipBase} bg-zk-tint text-zk-accent`}>{KIND[decision.kind].chip}</span>
            <span className={`${chipBase} ${severityChip[issue.sev]}`}>{SEV_LABEL[issue.sev]}</span>
            <span className={`${chipBase} bg-zk-chip text-zk-text2`}>{issue.area}</span>
          </div>
        </div>
        <TimerPill decision={decision} now={now} />
      </div>
      <dl className="mt-3.5 grid gap-x-4 gap-y-2.5 border-t border-zk-divider pt-3.5 text-[13px] sm:grid-cols-[136px_minmax(0,1fr)]">
        <dt className="font-semibold text-zk-muted">Why it's asking</dt>
        <dd className="text-zk-text">{reasons.length ? reasons.join(". ") + "." : "It wants your say."}</dd>
        <dt className="font-semibold text-zk-muted">Its plan</dt>
        <dd className="text-zk-text">
          {decision.plan}
          {decision.est ? <span className="text-zk-muted"> About {decision.est} min, {decision.conf}% sure.</span> : null}
        </dd>
        <dt className="font-semibold text-zk-muted">If you approve</dt>
        <dd>
          <ul className="space-y-1 text-zk-text">
            {lines.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zk-muted" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </dd>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={smallPrimary} disabled={expired || slotsFull} onClick={() => dispatch({ type: "approveOnce", id: decision.id })}>Approve once</button>
        <button type="button" className={smallSecondary} disabled={expired || slotsFull} onClick={() => setDialog("allow")}>Always allow this kind</button>
        <button type="button" className={smallGhost} disabled={expired} onClick={() => dispatch({ type: "decline", id: decision.id })}>Not this one</button>
        <button type="button" className={smallGhost} disabled={expired} onClick={() => setDialog("never")}>Never allow this kind</button>
      </div>
      {dialog ? <RuleChangeDialog decision={decision} mode={dialog} onClose={() => setDialog(null)} /> : null}
    </article>
  );
}

function FindWorkCard({ decision, now }) {
  const { state, dispatch } = useStore();
  const [dialog, setDialog] = useState(null);
  const agent = agentById(decision.agent);
  const full = state.tasks.length >= MAX_TASKS;
  return (
    <article className={`rounded-[14px] border bg-zk-surface p-4 sm:p-5 ${decision.fresh ? "border-electric-blue-strong ring-4 ring-zk-tint" : "border-zk-border"}`} aria-label={`${agent.name}: found work`}>
      <div className="flex flex-wrap items-start gap-3">
        <AgentGraphic name={agent.name} status="waiting" size={36} />
        <div className="min-w-0 flex-1 basis-[220px]">
          <p className="text-[13px] text-zk-text2">
            <span className="font-semibold text-zk-text">{agent.name}</span> {KIND.findwork.verb} <span className="text-zk-muted">· {relTime(decision.created, now)}</span>
          </p>
          <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-zk-text">Here is what's open in Mobile that I could fix</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`${chipBase} bg-zk-tint text-zk-accent`}>Found work</span>
            <span className={`${chipBase} bg-zk-chip text-zk-text2`}>It has no rules yet</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-zk-text2">
        {full
          ? `You already hold ${MAX_TASKS} of ${MAX_TASKS} tasks, so I can't bid until one is delivered. If you approve one, I'll bid on it as soon as a slot frees up.`
          : "Each fix would be due 60 minutes after the reporter awards it, would use one of your task slots, and needs you to push the branch: I can't push to Zedu-Endor."}
      </p>
      <ul className="mt-3 space-y-2.5">
        {decision.options.map((option) => {
          const issue = issueByNumber(option.issue);
          return (
            <li key={option.issue} className="rounded-[12px] border border-zk-border p-3.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <A to={`/issues/${option.issue}`} className="min-w-0 text-sm font-bold text-zk-text hover:underline">
                  <span className="tabular-nums text-zk-muted">#{option.issue}</span> {issue.title}
                </A>
                <span className={`${chipBase} ${severityChip[issue.sev]}`}>{SEV_LABEL[issue.sev]}</span>
                <span className="ml-auto text-xs font-semibold tabular-nums text-zk-text2">{SOLVER_POINTS[issue.sev].toLocaleString()} pts if merged</span>
              </div>
              <p className="mt-1 text-[13px] text-zk-text2">
                About {option.est} min, {option.conf}% sure. {option.note}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" className={smallPrimary} onClick={() => dispatch({ type: "approveOnce", id: decision.id, option })}>Take this one</button>
                <button type="button" className={smallSecondary} onClick={() => setDialog(option)}>Always allow this kind</button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={smallGhost} onClick={() => dispatch({ type: "decline", id: decision.id })}>Not now</button>
        <A to={`/settings/agents/${agent.id}/rules`} className="text-[13px] font-semibold text-zk-accent hover:underline">Give it rules instead</A>
      </div>
      {dialog ? <RuleChangeDialog decision={decision} option={dialog} mode="allow" onClose={() => setDialog(null)} /> : null}
    </article>
  );
}

function QuestionCard({ question, now }) {
  const { dispatch } = useStore();
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState("");
  const agent = agentById(question.agent);
  const issue = issueByNumber(question.issue);
  if (question.status !== "pending") {
    return (
      <article className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[14px] border border-zk-divider bg-zk-bg px-4 py-3">
        <AgentGraphic name={agent.name} status="idle" size={28} />
        <p className="min-w-0 flex-1 text-[13px] text-zk-text2">
          <span className="font-semibold text-zk-info-fg">Answered</span>
          <span className="text-zk-muted"> · {agent.name} · #{question.issue} · {relTime(question.resolvedAt, now)}</span>
          <span className="block">You said: "{question.answer}"</span>
        </p>
      </article>
    );
  }
  return (
    <article className="rounded-[14px] border border-zk-border bg-zk-surface p-4 sm:p-5" aria-label={`${agent.name} asked a question`}>
      <div className="flex flex-wrap items-start gap-3">
        <AgentGraphic name={agent.name} status="waiting" size={36} />
        <div className="min-w-0 flex-1 basis-[220px]">
          <p className="text-[13px] text-zk-text2">
            <span className="font-semibold text-zk-text">{agent.name}</span> asked a question <span className="text-zk-muted">· {relTime(question.created, now)}</span>
          </p>
          <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-zk-text">
            <A to={`/issues/${question.issue}`} className="hover:underline">
              <span className="tabular-nums text-zk-muted">#{question.issue}</span> {issue.title}
            </A>
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-chip px-2.5 py-0.5 text-xs font-semibold text-zk-text2 max-sm:ml-12">
          <span aria-hidden="true">❓</span> Question
        </span>
      </div>
      <p className="mt-3 border-t border-zk-divider pt-3 text-[13px] text-zk-text">{question.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {question.quick.map((answer) => (
          <button key={answer} type="button" className={smallSecondary} onClick={() => dispatch({ type: "answer", id: question.id, text: answer })}>{answer}</button>
        ))}
        <button type="button" className={smallGhost} onClick={() => setWriting((value) => !value)} aria-expanded={writing}>Write an answer</button>
      </div>
      {writing ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) dispatch({ type: "answer", id: question.id, text: text.trim() });
          }}
        >
          <label className="sr-only" htmlFor={`answer-${question.id}`}>Your answer</label>
          <textarea id={`answer-${question.id}`} value={text} onChange={(event) => setText(event.target.value)} rows={3} className="w-full rounded-xl border border-zk-border bg-zk-surface px-3.5 py-2.5 text-sm text-zk-text placeholder:text-zk-muted focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20" placeholder="Answer in your own words" />
          <button type="submit" className={smallPrimary} disabled={!text.trim()}>Send answer</button>
        </form>
      ) : null}
    </article>
  );
}

function PausedBanner() {
  const { state, dispatch } = useStore();
  const paused = AGENTS.filter((agent) => state.agents[agent.id].paused);
  if (paused.length === 0) return null;
  const all = paused.length === AGENTS.length;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-zk-warn-bd bg-zk-warn-bg px-4 py-3 text-sm text-zk-warn-fg">
      <Icon.Pause className="shrink-0" />
      <p className="min-w-0 flex-1">
        <span className="font-bold">{all ? "All your agents are paused." : `${paused.map((a) => a.name).join(", ")} ${paused.length === 1 ? "is" : "are"} paused.`}</span>{" "}
        They keep any task they hold until its deadline. New bids and offers wait for you.
      </p>
      <button type="button" className={smallSecondary} onClick={() => dispatch({ type: "resumeAll" })}>{all ? "Resume all" : "Resume"}</button>
    </div>
  );
}

function NeedYourInput() {
  const { state } = useStore();
  const now = useNow(1000);
  const pending = state.decisions.filter((d) => d.status === "pending");
  const pendingQuestions = state.questions.filter((q) => q.status === "pending");
  const handled = [
    ...state.decisions.filter((d) => d.status !== "pending").map((d) => ({ type: "decision", at: d.resolvedAt, item: d })),
    ...state.questions.filter((q) => q.status !== "pending").map((q) => ({ type: "question", at: q.resolvedAt, item: q })),
  ].sort((a, b) => b.at - a.at);
  return (
    <div className="space-y-4">
      <PausedBanner />
      {pending.length + pendingQuestions.length === 0 ? (
        <div className="rounded-[20px] border border-zk-border bg-zk-surface px-4 py-12 text-center">
          <p className="font-bold text-zk-text">Nothing needs you right now.</p>
          <p className="mt-1.5 text-sm text-zk-muted">Your agents are working inside your rules. What they did is under Done under your rules.</p>
          <div className="mt-4">
            <A to="/issues?view=done" className="text-sm font-bold text-zk-accent hover:underline">See what they did</A>
          </div>
        </div>
      ) : null}
      {pending.length > 0 ? (
        <section aria-labelledby="decisions-heading" className="space-y-3">
          <h2 id="decisions-heading" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">
            Decisions <span className="rounded-full bg-zk-chip px-1.5 font-mono text-[11px] font-normal tracking-normal tabular-nums">{pending.length}</span>
          </h2>
          {pending.map((decision) => <DecisionCard key={decision.id} decision={decision} now={now} />)}
        </section>
      ) : null}
      {pendingQuestions.length > 0 ? (
        <section aria-labelledby="questions-heading" className="space-y-3">
          <h2 id="questions-heading" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">
            Questions <span className="rounded-full bg-zk-chip px-1.5 font-mono text-[11px] font-normal tracking-normal tabular-nums">{pendingQuestions.length}</span>
          </h2>
          {pendingQuestions.map((question) => <QuestionCard key={question.id} question={question} now={now} />)}
        </section>
      ) : null}
      {handled.length > 0 ? (
        <section aria-labelledby="handled-heading" className="space-y-2">
          <h2 id="handled-heading" className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Handled today</h2>
          {handled.map(({ type, item }) =>
            type === "decision" ? <DecisionCard key={item.id} decision={item} now={now} /> : <QuestionCard key={item.id} question={item} now={now} />,
          )}
        </section>
      ) : null}
    </div>
  );
}

function DoneUnderRules() {
  const { state } = useStore();
  const now = useNow(30000);
  return (
    <section aria-labelledby="done-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="done-heading" className="text-sm font-bold text-zk-text">What your agents did without asking you</h2>
        <p className="text-[13px] text-zk-muted">Each line says what allowed it. Change any agent's rules from the gear beside it.</p>
      </div>
      <ul className="issues-table">
        {state.digest.map((entry, index) => {
          const agent = agentById(entry.agent);
          return (
            <li key={entry.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 ${index < state.digest.length - 1 ? "border-b border-zk-divider" : ""}`}>
              <AgentGraphic name={agent.name} status="idle" size={28} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zk-text">
                  <span className="font-semibold">{agent.name}</span> {entry.text.charAt(0).toLowerCase() + entry.text.slice(1)}
                </p>
                <p className="text-xs text-zk-muted">
                  {relTime(entry.at, now)}
                  {entry.rule ? ` · rule: ${entry.rule}` : ""}
                  {entry.issue && issueByNumber(entry.issue) ? (
                    <>
                      {" · "}
                      <A to={`/issues/${entry.issue}`} className="font-semibold text-zk-accent hover:underline">Open #{entry.issue}</A>
                    </>
                  ) : null}
                </p>
              </div>
              <Stamp basis={entry.basis} you size="xs" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EmptyList({ title, body }) {
  return (
    <div className="rounded-[20px] border border-zk-border bg-zk-surface px-4 py-12 text-center">
      <p className="font-bold text-zk-text">{title}</p>
      <p className="mt-1.5 text-sm text-zk-muted">{body}</p>
    </div>
  );
}

export function IssuesPage({ query }) {
  const { state } = useStore();
  const status = query.get("status");
  const view = status ? null : query.get("view") || "input";
  const count = pendingCount(state);
  const counts = {
    input: count,
    design: 0,
    ideas: ISSUES.filter((issue) => issue.stage === "reported").length,
    drafts: 0,
    done: state.digest.length,
  };
  const statusIssues = status ? (status === "all" ? ISSUES : ISSUES.filter((issue) => issue.status === status)) : [];
  return (
    <div className="issues-page mx-auto w-full max-w-6xl space-y-5">
      <IssuesHeading />
      <div className="space-y-4">
        <TabsRow status={status} inboxActive={Boolean(view)} count={count} />
        {view ? (
          <>
            <HowTheInboxWorks focus={query.get("agent")} />
            <nav aria-label="Inbox lists" className="issues-inbox-tabs overflow-x-auto">
              <ul className="flex w-max gap-1 border-b border-zk-divider">
                {INBOX_TABS.map(({ view: tab, label }) => {
                  const on = view === tab;
                  return (
                    <li key={tab}>
                      <A
                        to={tab === "input" ? "/issues" : `/issues?view=${tab}`}
                        aria-current={on ? "page" : undefined}
                        className={`-mb-px inline-flex h-10 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zk-accent ${
                          on ? "border-electric-blue-strong font-semibold text-zk-text" : "border-transparent font-medium text-zk-text2 hover:text-zk-text"
                        }`}
                      >
                        {tab === "done" ? <Icon.Shield /> : null}
                        {label}
                        <span className={`rounded-full px-1.5 font-mono text-[11px] tabular-nums ${on ? "bg-zk-tint text-zk-accent" : tab === "input" && counts.input > 0 ? "bg-zk-bad-bg text-zk-bad-fg" : "bg-zk-chip text-zk-muted"}`}>{counts[tab]}</span>
                      </A>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {view === "input" ? <NeedYourInput /> : null}
            {view === "done" ? <DoneUnderRules /> : null}
            {view === "design" ? <EmptyList title="Nothing here right now." body="No redesign proposals are waiting for a decision." /> : null}
            {view === "drafts" ? <EmptyList title="Nothing here right now." body="No unstructured draft ideas are waiting to be structured." /> : null}
            {view === "ideas" ? <IssueTable issues={ISSUES.filter((issue) => issue.stage === "reported")} /> : null}
          </>
        ) : (
          <section className="issues-results flex flex-col gap-3.5">
            {statusIssues.length ? <IssueTable issues={statusIssues} /> : <EmptyList title="No issues match these filters." body="Try clearing filters, or report it with New issue." />}
          </section>
        )}
      </div>
    </div>
  );
}

export { formatDate, OWNER, neverLabel };
export { DecisionCard, QuestionCard };
