import { AGENTS, OWNER, SEV_LABEL, issueByNumber } from "../data.js";
import { useStore } from "../store.jsx";
import { A, Icon, Stamp, agentView, chipBase, severityChip, useNotInPrototype } from "../ui.jsx";

const chipClass = {
  tint: "bg-zk-tint text-zk-accent",
  ok: "bg-zk-ok-bg text-zk-ok-fg",
  bad: "bg-zk-bad-bg text-zk-bad-fg",
  chip: "bg-zk-chip text-zk-text2",
};

function StatCards({ stats }) {
  return (
    <div aria-label="Workspace summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <article
          key={stat.label}
          className="overview-stat-card zk-motion group relative flex flex-col gap-[18px] overflow-hidden rounded-[20px] border border-zk-border bg-zk-surface p-[22px] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[#BFD6FB] hover:shadow-[0_18px_40px_rgba(11,23,51,0.10),0_2px_6px_rgba(57,120,246,0.10)] motion-reduce:transform-none motion-reduce:transition-none"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-electric-blue to-sky-tint transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
          <div className="relative flex items-center justify-between gap-3">
            <span className="text-base font-bold text-zk-text">{stat.label}</span>
            <A to={stat.to} aria-label={`Open ${stat.label}`} className="zk-motion flex h-[38px] w-[38px] items-center justify-center rounded-full border border-zk-border text-zk-text transition-[background,color,border-color,transform] duration-300 group-hover:rotate-45 group-hover:border-electric-blue-strong group-hover:bg-electric-blue-strong group-hover:text-white motion-reduce:transform-none">
              <Icon.Arrow />
            </A>
          </div>
          <p className="zk-motion relative text-[30px] font-extrabold leading-none tabular-nums text-zk-text transition-colors duration-300 group-hover:text-zk-accent">{stat.value}</p>
          <div className="relative flex items-center gap-2 text-[13px] text-zk-muted">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${chipClass[stat.tone]}`}>{stat.chip}</span>
            {stat.note}
          </div>
        </article>
      ))}
    </div>
  );
}

function AssignedIssues() {
  const { state } = useStore();
  const issues = state.tasks.map(issueByNumber).filter(Boolean);
  return (
    <section aria-labelledby="assigned-issues-heading" className="flex flex-col gap-3.5 rounded-[20px] border border-zk-border bg-zk-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h2 id="assigned-issues-heading" className="text-lg font-bold text-zk-text">Assigned to me</h2>
          <span className="text-[13px] text-zk-muted">{issues.length} {issues.length === 1 ? "issue" : "issues"} · taken by your agents</span>
        </div>
        <A to="/issues?status=in_progress" className="inline-flex h-9 items-center rounded-full border border-zk-border bg-zk-surface px-3.5 text-[13px] font-bold text-zk-accent transition hover:bg-zk-tint">View all</A>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="flex items-center gap-4 rounded-full bg-zk-tint px-4 py-3.5 text-xs font-bold uppercase tracking-[0.05em] text-zk-accent">
            <span className="min-w-0 flex-1">Issue</span>
            <span className="w-24">Priority</span>
            <span className="w-[120px]">Taken by</span>
            <span className="w-[170px]">Who stands behind it</span>
          </div>
          <ul>
            {issues.map((issue, index) => {
              const entry = state.digest.find((g) => g.issue === issue.n && /offer/.test(g.text));
              return (
                <li key={issue.n} className={`flex items-center gap-4 px-4 py-3.5 ${index < issues.length - 1 ? "border-b border-zk-divider" : ""}`}>
                  <A to={`/issues/${issue.n}`} className="flex min-w-0 flex-1 flex-col gap-0.5 text-left text-zk-text">
                    <span className="truncate text-sm font-semibold leading-snug">{issue.title}</span>
                    <span className="text-xs text-zk-muted">#{issue.n} · {issue.area}</span>
                  </A>
                  <span className="w-24 shrink-0"><span className={`${chipBase} ${severityChip[issue.sev]}`}>{SEV_LABEL[issue.sev]}</span></span>
                  <span className="w-[120px] shrink-0 text-[13px] text-zk-text2">Ada's Claude</span>
                  <span className="w-[170px] shrink-0">{entry ? <Stamp basis={entry.basis} you size="xs" /> : null}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

const statusMeta = {
  waiting: { label: "Waiting on you", dot: "bg-sky-tint", text: "text-zk-info-fg" },
  working: { label: "Working", dot: "bg-zk-warn-fg", text: "text-zk-warn-fg" },
  idle: { label: "Idle", dot: "bg-zk-ok-fg", text: "text-zk-ok-fg" },
  offline: { label: "Offline", dot: "bg-zk-muted", text: "text-zk-muted" },
  paused: { label: "Paused", dot: "bg-zk-muted", text: "text-zk-muted" },
};

function DashboardAgents() {
  const { state } = useStore();
  return (
    <section aria-labelledby="agents-heading" className="overflow-hidden rounded-[20px] border border-zk-border bg-zk-surface">
      <div className="flex items-center justify-between border-b border-zk-divider px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 id="agents-heading" className="text-base font-bold text-zk-text sm:text-lg">Your agents</h2>
          <span className="rounded-full border border-zk-border bg-zk-tint px-2 py-0.5 text-xs font-semibold text-zk-accent">{AGENTS.length}</span>
        </div>
        <span className="text-[13px] text-zk-muted">What each one earned you this week, and the rules it works under</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zk-divider bg-zk-tint/70 text-xs font-semibold uppercase tracking-wider text-zk-accent">
              <th scope="col" className="px-5 py-3">Agent</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Rules</th>
              <th scope="col" className="px-5 py-3 text-right">This week</th>
              <th scope="col" className="px-5 py-3">Current activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zk-divider">
            {AGENTS.map((agent) => {
              const view = agentView(state, agent);
              const meta = statusMeta[view.status];
              const rules = state.rules[agent.id];
              return (
                <tr key={agent.id} className="transition hover:bg-zk-tint/40">
                  <td className="px-5 py-3.5 font-semibold text-zk-text">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
                      <span className="truncate">{agent.name}</span>
                      <span className="truncate text-xs font-normal text-zk-muted">{agent.model}</span>
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 font-medium ${meta.text}`}>{meta.label}</td>
                  <td className="max-w-[14rem] px-5 py-3.5">
                    <A to={`/settings/agents/${agent.id}/rules`} className="inline-flex max-w-full items-center gap-1 truncate text-[13px] font-semibold text-zk-accent hover:underline">
                      <Icon.Shield className="shrink-0" />
                      <span className="truncate">{rules ? rules.name : "No rules yet"}</span>
                    </A>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <span className={`font-bold tabular-nums ${agent.weekPoints > 0 ? "text-zk-text" : "text-zk-bad-fg"}`}>{agent.weekPoints.toLocaleString()} pts</span>
                    {agent.weekPoints === 0 ? (
                      <A to={`/settings/agents/${agent.id}/rules`} className="ml-2 text-xs font-bold text-zk-accent underline">Why?</A>
                    ) : null}
                  </td>
                  <td className="max-w-[22rem] truncate px-5 py-3.5 text-zk-text2" title={view.activity}>{view.activity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const notHere = useNotInPrototype();
  const { state } = useStore();
  const stats = [
    { label: "Points", value: "1,110", to: "/dashboard", chip: "Goal met", tone: "ok", note: "500 required this week" },
    { label: "Created by me", value: "4", to: "/issues?status=all", chip: "+2", tone: "ok", note: "in the last 30 days" },
    { label: "Assigned to me", value: String(state.tasks.length), to: "/issues?status=in_progress", chip: String(state.tasks.length), tone: "bad", note: "high priority" },
    { label: "Resolved issues", value: "3", to: "/issues?status=resolved", chip: "75%", tone: "chip", note: "of issues assigned to me" },
  ];
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-zk-text">Welcome back, {OWNER.first}</h1>
          <p className="text-sm text-zk-muted">Issues, votes and your points for Ziki at a glance.</p>
        </div>
        <a href="#" onClick={notHere} className="inline-flex h-[42px] items-center gap-2 rounded-full border border-zk-border bg-zk-surface px-5 text-sm font-semibold text-zk-text hover:bg-zk-chip">
          <Icon.Plus /> New issue
        </a>
      </div>
      <StatCards stats={stats} />
      <DashboardAgents />
      <AssignedIssues />
    </div>
  );
}
