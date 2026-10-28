import { useEffect, useMemo, useState } from "react";
import {
  ACTIONS,
  AREAS,
  LEVEL_ACTIONS,
  LEVEL_LABEL,
  OWNER,
  SCOUT_WEEK,
  SEVERITIES,
  SEV_LABEL,
  TEMPLATES,
  TIMEZONE,
  agentById,
  coverage,
  formatDate,
  neverLabel,
  newRulesFor,
  ruleClauses,
} from "../data.js";
import { useStore } from "../store.jsx";
import {
  A,
  AgentGraphic,
  Icon,
  StatusChip,
  agentView,
  agentsLink,
  agentsSurface,
  dangerBtn,
  levelBadge,
  primaryBtn,
  secondaryBtn,
  useNotInPrototype,
} from "../ui.jsx";

const sectionTitle = "text-sm font-bold uppercase tracking-[0.06em] text-zk-muted";

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysUntil(iso) {
  const target = new Date(`${iso}T12:00:00`);
  return Math.round((target.getTime() - Date.now()) / 86400000);
}

export function RuleSentence({ agent, rules, size = "lg" }) {
  const clauses = ruleClauses(agent, rules);
  return (
    <p className={size === "lg" ? "text-[19px] leading-[1.45] text-zk-text sm:text-[21px]" : "text-[15px] leading-[1.45] text-zk-text"}>
      {clauses.map((clause, index) => (
        <span key={`${clause.label}-${index}`} className="mb-2.5 mr-[0.3em] inline-flex max-w-full flex-col align-top">
          <span className="font-medium underline decoration-electric-blue decoration-2 underline-offset-[5px]">{clause.text}</span>
          <span className="mt-1 text-[11.5px] font-semibold text-zk-muted">{clause.label}</span>
        </span>
      ))}
    </p>
  );
}

function Chip({ checked, onChange, children, name }) {
  return (
    <label className="issues-filter-option">
      <input type="checkbox" name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="issues-filter-check" aria-hidden="true" />
      {children}
    </label>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full bg-zk-seg p-1">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          role="radio"
          aria-checked={value === optionValue}
          onClick={() => onChange(optionValue)}
          className={`min-h-[34px] rounded-full px-3.5 text-[13px] transition ${value === optionValue ? "bg-zk-surface font-bold text-zk-text shadow-sm" : "font-medium text-zk-text2 hover:text-zk-text"}`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, min, max, onChange, unit }) {
  return (
    <div className="flex items-center gap-2">
      <span className="min-w-0 flex-1 text-sm text-zk-text">{label}</span>
      <div className="inline-flex items-center rounded-full border border-zk-border bg-zk-surface">
        <button type="button" aria-label={`Fewer ${unit}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zk-text hover:bg-zk-chip disabled:opacity-40">−</button>
        <span className="min-w-8 text-center text-sm font-bold tabular-nums text-zk-text" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${unit}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zk-text hover:bg-zk-chip disabled:opacity-40">+</button>
      </div>
    </div>
  );
}

function Fieldset({ title, hint, children }) {
  return (
    <fieldset className="space-y-3 border-t border-zk-divider pt-5 first:border-t-0 first:pt-0">
      <legend className="float-left w-full">
        <span className="block text-sm font-bold text-zk-text">{title}</span>
        {hint ? <span className="mt-0.5 block text-xs text-zk-muted">{hint}</span> : null}
      </legend>
      <div className="clear-both space-y-3 pt-1">{children}</div>
    </fieldset>
  );
}

function CoverageBar({ label, cov, highlight = false }) {
  const pct = cov.total ? Math.round((cov.covered / cov.total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
        <span className={highlight ? "font-bold text-zk-text" : "font-semibold text-zk-text2"}>{label}</span>
        <span className="tabular-nums text-zk-text2">
          <span className="font-bold text-zk-ok-fg">{cov.covered} on its own</span> · <span className="font-bold text-zk-warn-fg">{cov.asked} asked you</span>
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-zk-seg" aria-hidden="true">
        <div className="h-full bg-zk-ok-fg/80 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        <div className="h-full bg-zk-warn-bd transition-[width] duration-300" style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

function WhyNotEarning({ agent, onUseTemplate }) {
  const trusted = TEMPLATES.find((t) => t.id === "trusted");
  const cov = coverage(newRulesFor(agent, trusted.make(agent)), agent.id);
  return (
    <section aria-labelledby="why-heading" className="rounded-[20px] border border-zk-warn-bd bg-zk-warn-bg p-4 sm:p-5">
      <h2 id="why-heading" className="flex items-center gap-2 text-sm font-bold text-zk-warn-fg">
        <Icon.Alert size={14} /> Why {agent.name} earned nothing this week
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zk-text">
        It has no rules, so it asked you before every bid and every offer: {SCOUT_WEEK.requests} requests this week. You answered {SCOUT_WEEK.answered}. The other {SCOUT_WEEK.expired} expired while it waited, and {SCOUT_WEEK.offersExpired} of those were offers that moved on to someone else.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zk-text">
        With the <span className="font-bold">Trusted</span> template it would have handled {cov.covered} of those {cov.total} on its own, and asked you about {cov.asked}.
      </p>
      <button type="button" onClick={onUseTemplate} className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-electric-blue-strong px-3.5 text-[13px] font-bold text-white hover:bg-[#2552af]">
        Start from Trusted
      </button>
    </section>
  );
}

export function RulesPage({ agentId }) {
  const { state, dispatch } = useStore();
  const notHere = useNotInPrototype();
  const agent = agentById(agentId);
  const saved = agent ? state.rules[agent.id] : null;
  const [draft, setDraft] = useState(() => (agent ? JSON.parse(JSON.stringify(saved ?? newRulesFor(agent, { actions: [] }))) : null));
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (agent) setDraft(JSON.parse(JSON.stringify(saved ?? newRulesFor(agent, { actions: [] }))));
    setTemplate(null);
    // Reload the form when the saved rules change from elsewhere (an Inbox decision).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, JSON.stringify(saved)]);

  useEffect(() => {
    if (agentId === "scout") dispatch({ type: "tourSeen", step: "why" });
  }, [agentId, dispatch]);

  const dirty = useMemo(() => {
    if (!agent || !draft) return false;
    if (!saved) return draft.actions.length > 0 || draft.limits.file > 0;
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }, [draft, saved, agent]);

  if (!agent) {
    return (
      <section className="mx-auto max-w-xl rounded-[24px] border border-zk-border bg-zk-surface px-6 py-12 text-center">
        <h1 className="text-2xl font-extrabold text-zk-text">No such agent</h1>
        <A to="/settings/agents" className={`mt-4 inline-flex text-sm ${agentsLink}`}>Back to agents</A>
      </section>
    );
  }

  const view = agentView(state, agent);
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const toggleIn = (list, item, on) => (on ? [...new Set([...list, item])] : list.filter((x) => x !== item));
  const applyTemplate = (id) => {
    const t = TEMPLATES.find((each) => each.id === id);
    setTemplate(id);
    setDraft((current) => ({ ...current, ...t.make(agent), limits: { ...current.limits, ...t.make(agent).limits }, name: `${t.name} rules` }));
  };
  const savedCov = coverage(saved ? { ...saved, paused: false } : null, agent.id);
  const draftCov = coverage({ ...draft, paused: false }, agent.id);
  const contributor = agent.level === "contributor";
  const voteNever = draft.never.some((rule) => rule.action === "vote");
  const until = daysUntil(draft.until);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <A to="/settings/agents" className={`text-sm ${agentsLink}`}>← Back to agents</A>
        <div className="flex flex-wrap items-center gap-3">
          <AgentGraphic name={agent.name} status={view.status} size={44} />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-3xl font-extrabold tracking-tight text-zk-text">Rules for {agent.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${levelBadge[agent.level]}`}>{LEVEL_LABEL[agent.level]}</span>
              <StatusChip status={view.status} />
              <span className="text-xs text-zk-muted">{agent.model}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-zk-text2">
          {saved
            ? `${agent.name} acts on its own inside these rules. Anything outside them comes to your Inbox, with what it found, what it would do and what it would commit you to.`
            : `${agent.name} has no rules yet, so it asks you before everything. Give it rules and it acts on its own inside them; anything outside still comes to your Inbox.`}
        </p>
        <nav aria-label="Agent pages" className="flex gap-1 border-b border-zk-divider">
          <span aria-current="page" className="-mb-px inline-flex h-10 items-center border-b-2 border-electric-blue-strong px-3 text-[13px] font-semibold text-zk-text">Rules</span>
          <a href="#" onClick={notHere} className="-mb-px inline-flex h-10 items-center border-b-2 border-transparent px-3 text-[13px] font-medium text-zk-text2 hover:text-zk-text">Messages and instructions</a>
        </nav>
      </div>

      {agent.id === "scout" && !saved ? <WhyNotEarning agent={agent} onUseTemplate={() => applyTemplate("trusted")} /> : null}

      <section className={`${agentsSurface} p-4 sm:p-6`} aria-labelledby="sentence-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="sentence-heading" className={sectionTitle}>These rules, as {agent.name} reads them</h2>
          {dirty ? <span className="rounded-full bg-zk-warn-bg px-2 py-0.5 text-xs font-bold text-zk-warn-fg">Not saved yet</span> : null}
        </div>
        <div className="mt-4">
          <RuleSentence agent={agent} rules={saved || draft.actions.length > 0 || !contributor ? draft : null} />
        </div>
        <p className="mt-2 text-xs text-zk-muted">
          {saved ? `Set ${saved.setAgo}. ` : ""}Ziki checks every bid, offer and report against these rules at the moment the agent acts.
        </p>
      </section>

      <section className={`${agentsSurface} space-y-4 p-4 sm:p-6`} aria-labelledby="preview-heading">
        <div>
          <h2 id="preview-heading" className={sectionTitle}>What these rules would have meant last week</h2>
          <p className="mt-1 text-xs text-zk-muted">Replayed against {agent.name}'s last 7 days of actions, before daily limits.</p>
        </div>
        {dirty ? <CoverageBar label="Saved rules" cov={savedCov} /> : null}
        <CoverageBar label={dirty ? "With your changes" : "These rules"} cov={draftCov} highlight />
      </section>

      {contributor ? (
        <section className={`${agentsSurface} p-4 sm:p-6`} aria-labelledby="templates-heading">
          <h2 id="templates-heading" className={sectionTitle}>Start from a template</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TEMPLATES.map((t) => {
              const cov = coverage({ ...newRulesFor(agent, t.make(agent)) }, agent.id);
              const on = template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => applyTemplate(t.id)}
                  className={`flex flex-col items-start gap-1 rounded-[14px] border p-3.5 text-left transition ${on ? "border-electric-blue-strong bg-zk-tint" : "border-zk-border bg-zk-surface hover:bg-zk-chip"}`}
                >
                  <span className="text-sm font-bold text-zk-text">{t.name}</span>
                  <span className="text-[13px] text-zk-text2">{t.blurb}</span>
                  <span className="text-xs tabular-nums text-zk-muted">Last week: {cov.covered} on its own, {cov.asked} asked</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <form
        className={`${agentsSurface} space-y-5 p-4 sm:p-6`}
        aria-label={`Edit rules for ${agent.name}`}
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "saveRules", id: agent.id, rules: draft });
        }}
      >
        <Fieldset title="What it may do on its own" hint={contributor ? "Anything you leave unticked comes to you first." : `A ${LEVEL_LABEL[agent.level].toLowerCase()} can only do this one kind of work.`}>
          <div className="issues-filter-options">
            {LEVEL_ACTIONS[agent.level].map((action) =>
              action === "vote" ? null : (
                <Chip key={action} name="actions" checked={draft.actions.includes(action)} onChange={(on) => update({ actions: toggleIn(draft.actions, action, on) })}>
                  {ACTIONS[action].label}
                </Chip>
              ),
            )}
          </div>
        </Fieldset>

        <Fieldset title="Which issues" hint="It only acts alone on issues inside both limits.">
          {contributor ? (
            <div className="space-y-2">
              <span className="block text-[13px] font-semibold text-zk-text2">Lowest severity it may take</span>
              <Segmented
                label="Lowest severity"
                value={draft.minSeverity}
                onChange={(value) => update({ minSeverity: value })}
                options={SEVERITIES.map((sev) => [sev, sev === "low" ? "Any" : sev === "critical" ? "Critical only" : `${SEV_LABEL[sev]} and up`])}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <span className="block text-[13px] font-semibold text-zk-text2">Areas</span>
            <div className="issues-filter-options">
              {AREAS.map((area) => (
                <Chip key={area} name="areas" checked={draft.areas.includes(area)} onChange={(on) => update({ areas: toggleIn(draft.areas, area, on) })}>
                  {area}
                </Chip>
              ))}
            </div>
          </div>
        </Fieldset>

        <Fieldset title="How much" hint="Never more than the project allows: 2 tasks at a time and 30 writes an hour.">
          {contributor ? (
            <>
              {draft.actions.includes("bid") ? <Stepper label="Bids a day" unit="bids" value={draft.limits.bid} min={1} max={10} onChange={(value) => update({ limits: { ...draft.limits, bid: value } })} /> : null}
              {draft.actions.includes("file") ? <Stepper label="New issues a day" unit="issues" value={draft.limits.file || 1} min={1} max={20} onChange={(value) => update({ limits: { ...draft.limits, file: value } })} /> : null}
              <Stepper label="Tasks at a time" unit="tasks" value={draft.maxTasks} min={1} max={2} onChange={(value) => update({ maxTasks: value })} />
            </>
          ) : (
            <Stepper
              label={agent.level === "reviewer" ? "Reviews a day" : "Checks a day"}
              unit="a day"
              value={agent.level === "reviewer" ? draft.limits.review : draft.limits.triage}
              min={1}
              max={40}
              onChange={(value) => update({ limits: { ...draft.limits, [agent.level === "reviewer" ? "review" : "triage"]: value } })}
            />
          )}
        </Fieldset>

        <Fieldset title="When" hint={`Outside these hours it asks or waits, even for work its rules cover. Times are ${TIMEZONE}.`}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-zk-text">
            <label className="flex items-center gap-2">
              <span className="text-zk-text2">From</span>
              <input type="time" value={draft.hours.from} onChange={(event) => update({ hours: { ...draft.hours, from: event.target.value } })} className="h-10 rounded-xl border border-zk-border bg-zk-surface px-3 text-sm text-zk-text focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20" />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-zk-text2">to</span>
              <input type="time" value={draft.hours.to} onChange={(event) => update({ hours: { ...draft.hours, to: event.target.value } })} className="h-10 rounded-xl border border-zk-border bg-zk-surface px-3 text-sm text-zk-text focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20" />
            </label>
            <button type="button" onClick={() => update({ hours: { from: "00:00", to: "23:59" } })} className="h-9 rounded-full px-3 text-[13px] font-semibold text-zk-accent hover:bg-zk-tint">Any hour</button>
          </div>
        </Fieldset>

        <Fieldset title="Until" hint="Rules always end. Renewing them is something you do on purpose.">
          <Segmented
            label="Rules last for"
            value={["30", "60", "90"].find((days) => Math.abs(until - Number(days)) <= 1) ?? ""}
            onChange={(value) => update({ until: addDays(Number(value)) })}
            options={[
              ["30", "30 days"],
              ["60", "60 days"],
              ["90", "90 days (longest)"],
            ]}
          />
          <p className="text-xs text-zk-muted">Ends {formatDate(draft.until)}, in {until} days.</p>
        </Fieldset>

        <Fieldset title="Outside these rules">
          <Segmented
            label="Outside these rules"
            value={draft.outside}
            onChange={(value) => update({ outside: value })}
            options={[
              ["ask", `Ask ${OWNER.first} first`],
              ["decline", "Skip it quietly"],
            ]}
          />
        </Fieldset>

        {contributor ? (
          <Fieldset title="Never" hint="Never rules win over everything above.">
            <div className="issues-filter-options">
              <Chip name="never-vote" checked={voteNever} onChange={(on) => update({ never: on ? [...draft.never, { action: "vote" }] : draft.never.filter((rule) => rule.action !== "vote") })}>
                Upvote issues
              </Chip>
              {draft.never
                .filter((rule) => rule.area)
                .map((rule) => (
                  <Chip key={rule.area} name="never-area" checked onChange={() => update({ never: draft.never.filter((r) => r !== rule) })}>
                    {neverLabel(rule)}
                  </Chip>
                ))}
            </div>
          </Fieldset>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-zk-divider pt-5">
          <button type="submit" className={primaryBtn} disabled={!dirty}>Save rules</button>
          <button type="button" className={secondaryBtn} disabled={!dirty} onClick={() => setDraft(JSON.parse(JSON.stringify(saved ?? newRulesFor(agent, { actions: [] }))))}>Discard changes</button>
          <button
            type="button"
            className={`${dangerBtn} sm:ml-auto`}
            onClick={() => dispatch({ type: state.agents[agent.id].paused ? "work" : "stop", id: agent.id })}
          >
            {state.agents[agent.id].paused ? "Resume this agent" : "Pause this agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
