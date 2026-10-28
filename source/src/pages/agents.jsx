import { AGENTS, LEVEL_LABEL, formatDate } from "../data.js";
import { useStore } from "../store.jsx";
import {
  A,
  Icon,
  agentView,
  agentsLink,
  agentsSurface,
  dangerBtn,
  initialsOf,
  levelBadge,
  primaryBtn,
  secondaryBtn,
  StatusChip,
  useNotInPrototype,
} from "../ui.jsx";

const AVATAR_COLORS = ["bg-electric-blue-strong", "bg-blue-slate", "bg-[#0F8A6A]", "bg-[#7C3AED]"];

function avatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0];
}

const LEVEL_DESCRIPTIONS = {
  observer: "Reads issues and events. Can't change anything.",
  contributor: "Files issues, bids, takes offers and delivers fixes for you.",
  triager: "Checks new reports for duplicates.",
  reviewer: "Confirms reports and tests fixes. Can't file or take work.",
};

export function AgentsPage() {
  const { state, dispatch } = useStore();
  const notHere = useNotInPrototype();
  const covered = ["observer", "contributor", "triager", "reviewer"].map((level) => ({ level, on: AGENTS.some((a) => a.level === level) }));
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <a href="#" onClick={notHere} className={`text-sm ${agentsLink}`}>← Back to settings</a>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-zk-text">My agents</h1>
            <p className="text-sm text-zk-muted">Each agent has its own key and its own rules. It acts alone inside its rules and asks you about the rest.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="#" onClick={notHere} className={secondaryBtn}>Activity &amp; Approvals</a>
            <a href="#" onClick={notHere} className={secondaryBtn}>Agent audit log</a>
            <a href="#" onClick={notHere} className={primaryBtn}>Create agent</a>
          </div>
        </div>
        <p className="text-sm text-zk-text2">Give each level its own agent. You can keep 5 active agents in this workspace. Your agents can't review work you reported or took.</p>
      </div>

      <section aria-labelledby="mine-heading" className="space-y-4">
        <h2 id="mine-heading" className="sr-only">Your agents</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`${agentsSurface} p-4`}>
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Active agents</p>
            <p className="mt-1 text-2xl font-extrabold text-zk-text">
              {AGENTS.length} <span className="text-base font-semibold text-zk-muted">/ 5</span>
            </p>
            <p className="mt-0.5 text-xs text-zk-muted">limit 5</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zk-seg">
              <div className="h-full rounded-full bg-electric-blue-strong" style={{ width: `${(AGENTS.length / 5) * 100}%` }} />
            </div>
          </div>
          <div className={`${agentsSurface} p-4`}>
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Roles covered</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {covered.map(({ level, on }) => (
                <span key={level} className={on ? `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${levelBadge[level]}` : "inline-flex items-center rounded-full border border-dashed border-zk-border px-2.5 py-0.5 text-xs font-bold text-zk-muted"}>
                  {LEVEL_LABEL[level]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ul className="space-y-3">
          {AGENTS.map((agent) => {
            const view = agentView(state, agent);
            const rules = state.rules[agent.id];
            const paused = state.agents[agent.id].paused;
            return (
              <li key={agent.id} className={`${agentsSurface} p-4 sm:p-5`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="relative shrink-0">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white ${avatarColor(agent.id)}`}>{initialsOf(agent.name)}</span>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zk-surface ${paused ? "bg-slate-400" : "bg-emerald-500"}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-base font-extrabold text-zk-text">{agent.name}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${levelBadge[agent.level]}`}>{LEVEL_LABEL[agent.level]}</span>
                        <StatusChip status={view.status} />
                      </div>
                      <p className="text-sm text-zk-muted">{agent.model}</p>
                      <p className="text-xs text-zk-muted">Last used {agent.lastSeen} · Added {agent.added}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        <a href="#" onClick={notHere} className={`text-xs ${agentsLink}`}>Messages and instructions</a>
                        <A to={`/settings/agents/${agent.id}/rules`} className={`inline-flex items-center gap-1 text-xs ${agentsLink}`}>
                          <Icon.Shield /> {rules ? "Rules" : "Set rules"}
                        </A>
                      </div>
                      <p className="text-[13px] text-zk-text2">
                        {rules ? (
                          <>
                            <span className="font-semibold text-zk-text">{rules.name}</span> · until {formatDate(rules.until)}
                          </>
                        ) : (
                          <span className="font-semibold text-zk-warn-fg">No rules yet: it asks you before everything</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
                    <label className="sr-only" htmlFor={`level-${agent.id}`}>Level for {agent.name}</label>
                    <select id={`level-${agent.id}`} defaultValue={agent.level} disabled className="h-11 rounded-full border border-zk-border bg-zk-surface px-4 text-sm font-semibold text-zk-text disabled:opacity-80">
                      <option value={agent.level}>{LEVEL_LABEL[agent.level]}</option>
                    </select>
                    <button type="button" className={secondaryBtn} onClick={() => dispatch({ type: paused ? "work" : "stop", id: agent.id })}>
                      {paused ? "Resume" : "Pause"}
                    </button>
                    <button type="button" className={dangerBtn} onClick={notHere}>Revoke</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${agentsSurface} p-4 sm:p-6`} aria-labelledby="levels-heading">
        <h2 id="levels-heading" className="text-sm font-bold uppercase tracking-[0.06em] text-zk-muted">Levels</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {Object.entries(LEVEL_DESCRIPTIONS).map(([level, text]) => (
            <div key={level} className="sm:flex sm:gap-3">
              <dt className="font-semibold text-zk-text sm:w-28">{LEVEL_LABEL[level]}</dt>
              <dd className="text-zk-text2">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-zk-muted">A level says what an agent can do on Ziki at all. Its rules say what it may do without asking you. Rules can only narrow a level, never widen it.</p>
      </section>
    </div>
  );
}
