import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import {
  AGENTS,
  INITIAL_RULES,
  MAX_TASKS,
  OWNER,
  agentById,
  covers,
  forbid,
  issueByNumber,
  widen,
} from "./data.js";

const STORAGE_KEY = "zm-prototype-v2";

/** The action a decision asks for, in the shape the rules check reads. */
export function actOf(decision, option) {
  const issue = issueByNumber(option ? option.issue : decision.issue);
  const action = decision.kind === "findwork" ? "bid" : decision.kind;
  return { action, sev: issue?.sev, area: issue?.area, hour: 14 };
}

function initialState() {
  const now = Date.now();
  return {
    version: 2,
    rules: JSON.parse(JSON.stringify(INITIAL_RULES)),
    agents: Object.fromEntries(
      AGENTS.map((agent) => [agent.id, { status: agent.status, activity: agent.activity, paused: false }]),
    ),
    tasks: [812],
    decisions: [
      {
        id: "d815",
        kind: "accept",
        agent: "claude",
        issue: 815,
        created: now - 4 * 60 * 1000,
        holdUntil: now + 24 * 60 * 1000,
        plan: "Clear the cache key when the workspace changes, and add a regression test that switches workspaces mid-sync.",
        est: 45,
        conf: 70,
        status: "pending",
      },
      {
        id: "d812",
        kind: "extend",
        agent: "claude",
        issue: 812,
        created: now - 2 * 60 * 1000,
        deadline: now + 22 * 60 * 1000,
        plan: "The fix is done and its tests pass locally, but CI is queued behind 14 jobs. I need 30 more minutes for the pipeline to report.",
        status: "pending",
      },
      {
        id: "d818",
        kind: "bid",
        agent: "claude",
        issue: 818,
        created: now - 19 * 60 * 1000,
        plan: "Guard the avatar component against an empty URL and fall back to initials, as the web app already does.",
        est: 30,
        conf: 80,
        status: "pending",
      },
    ],
    questions: [
      {
        id: "q809",
        agent: "reviewer",
        issue: 809,
        created: now - 64 * 60 * 1000,
        body: "Report #809 has no steps to reproduce, and I couldn't reproduce it on staging. Should I reject it, or ask the reporter for steps first?",
        quick: ["Ask the reporter for steps first", "Reject it"],
        status: "pending",
      },
    ],
    digest: [
      { id: "g1", at: now - 38 * 60 * 1000, agent: "claude", text: "Accepted the offer for #812 and started the fix", issue: 812, basis: "mandate", rule: "High-severity web fixes" },
      { id: "g2", at: now - 52 * 60 * 1000, agent: "claude", text: "Bid on #812", issue: 812, basis: "mandate", rule: "High-severity web fixes" },
      { id: "g3", at: now - 70 * 60 * 1000, agent: "reviewer", text: "Confirmed report #811 as real, high severity", issue: 811, basis: "mandate", rule: "Reviews in Web and Desktop" },
      { id: "g4", at: now - 2 * 3600 * 1000, agent: "triager", text: "Cleared #811 as not a duplicate", issue: 811, basis: "mandate", rule: "Duplicate checks everywhere" },
      { id: "g5", at: now - 3 * 3600 * 1000, agent: "reviewer", text: "Marked the fix for #808 good to merge", issue: 808, basis: "mandate", rule: "Reviews in Web and Desktop" },
      { id: "g6", at: now - 26 * 3600 * 1000, agent: "claude", text: "Accepted the offer for #805 after you approved it", issue: 805, basis: "explicit" },
    ],
    award817: null,
    pausedAll: false,
    scoutSearch: "idle",
    tour: { allow: false, scout: false, why: false, award: false, pause: false },
    tourOpen: false,
    toasts: [],
  };
}

function load() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return parsed?.version === 2 ? { ...parsed, toasts: [] } : initialState();
  } catch {
    return initialState();
  }
}

let toastSeq = 0;

function withToast(state, text, tone = "ok") {
  toastSeq += 1;
  return { ...state, toasts: [...state.toasts, { id: `${Date.now()}-${toastSeq}`, text, tone }] };
}

function addDigest(state, entry) {
  return { ...state, digest: [{ id: `g${Date.now()}${Math.random()}`, at: Date.now(), ...entry }, ...state.digest] };
}

function setAgent(state, id, patch) {
  return { ...state, agents: { ...state.agents, [id]: { ...state.agents[id], ...patch } } };
}

/** The agent's rules with its pause applied, as the check sees them. */
export function effectiveRules(state, agentId) {
  const rules = state.rules[agentId];
  if (!rules) return null;
  return state.agents[agentId]?.paused ? { ...rules, paused: true } : rules;
}

function issueLabel(n) {
  const issue = issueByNumber(n);
  return issue ? `#${n} ${issue.title}` : `#${n}`;
}

/** What approving a decision does: the action runs, and is recorded. */
function carryOut(state, decision, basis, option) {
  const agent = agentById(decision.agent);
  const ruleName = state.rules[decision.agent]?.name;
  const tag = basis === "mandate" ? { basis, rule: ruleName } : { basis };
  if (decision.kind === "accept") {
    let next = { ...state, tasks: [...new Set([...state.tasks, decision.issue])] };
    next = setAgent(next, decision.agent, { status: "working", activity: `Working on ${issueLabel(decision.issue)}` });
    return addDigest(next, { agent: decision.agent, text: `Accepted the offer for #${decision.issue} and started the fix`, issue: decision.issue, ...tag });
  }
  if (decision.kind === "bid") {
    return addDigest(state, { agent: decision.agent, text: `Bid on #${decision.issue}`, issue: decision.issue, ...tag });
  }
  if (decision.kind === "extend") {
    return addDigest(state, { agent: decision.agent, text: `Used its one extension on #${decision.issue}: 60 more minutes`, issue: decision.issue, ...tag });
  }
  if (decision.kind === "findwork" && option) {
    const full = state.tasks.length >= MAX_TASKS;
    let next = setAgent(state, decision.agent, {
      status: full ? "idle" : "working",
      activity: full ? `Will bid on #${option.issue} when a task slot frees up` : `Bid on ${issueLabel(option.issue)}`,
    });
    next = addDigest(next, {
      agent: decision.agent,
      text: full ? `Queued a bid on #${option.issue} until a task slot frees up` : `Bid on #${option.issue}`,
      issue: option.issue,
      ...tag,
    });
    return { ...next, scoutSearch: "done" };
  }
  void agent;
  return state;
}

function resolve(state, id, patch) {
  return { ...state, decisions: state.decisions.map((d) => (d.id === id ? { ...d, ...patch, resolvedAt: Date.now() } : d)) };
}

/** After the rules change, anything else now covered goes ahead without asking. */
function sweepCovered(state, agentId, exceptId) {
  const rules = effectiveRules(state, agentId);
  let next = state;
  const swept = [];
  for (const decision of state.decisions) {
    if (decision.id === exceptId || decision.agent !== agentId || decision.status !== "pending") continue;
    if (decision.kind === "findwork") continue;
    if (covers(rules, actOf(decision))) {
      next = resolve(next, decision.id, { status: "covered", outcome: "Covered by your new rules, so it went ahead without asking." });
      next = carryOut(next, decision, "mandate");
      swept.push(decision.issue);
    }
  }
  return { next, swept };
}

function reducer(state, action) {
  switch (action.type) {
    case "approveOnce": {
      const decision = state.decisions.find((d) => d.id === action.id);
      if (!decision || decision.status !== "pending") return state;
      const option = action.option;
      const full = decision.kind === "findwork" && state.tasks.length >= MAX_TASKS;
      let next = resolve(state, decision.id, {
        status: "approved",
        option: option?.issue ?? null,
        outcome:
          decision.kind === "accept"
            ? "The fix is due 60 minutes from now, and its pull request is yours to push."
            : decision.kind === "extend"
              ? "The deadline moved 60 minutes later; that was this task's only extension."
              : decision.kind === "findwork"
                ? full
                  ? `You hold ${MAX_TASKS} of ${MAX_TASKS} tasks, so it bids on #${option.issue} as soon as one is delivered.`
                  : `It bid on #${option.issue}; the reporter awards the work.`
                : "It placed the bid; the reporter awards the work.",
      });
      next = carryOut(next, decision, "explicit", option);
      if (decision.kind === "findwork") next = { ...next, tour: { ...next.tour, scout: true } };
      return withToast(next, `${agentById(decision.agent).name}: approved once.`);
    }
    case "alwaysAllow": {
      const decision = state.decisions.find((d) => d.id === action.id);
      if (!decision || decision.status !== "pending") return state;
      const agent = agentById(decision.agent);
      const before = state.rules[decision.agent];
      const after = widen(agent, before, actOf(decision, action.option));
      let next = { ...state, rules: { ...state.rules, [decision.agent]: after } };
      next = resolve(next, decision.id, {
        status: "rule",
        option: action.option?.issue ?? null,
        outcome: `${agent.name}'s rules are now "${after.name}". Work like this goes ahead without asking.`,
      });
      next = carryOut(next, decision, "mandate", action.option);
      const { next: swept, swept: issues } = sweepCovered(next, decision.agent, decision.id);
      next = swept;
      next = { ...next, tour: { ...next.tour, allow: next.tour.allow || decision.kind !== "findwork", scout: next.tour.scout || decision.kind === "findwork" } };
      const extra = issues.length ? ` It also covers #${issues.join(", #")}, so that went ahead too.` : "";
      return withToast(next, `Rules updated for ${agent.name}.${extra}`);
    }
    case "decline": {
      const decision = state.decisions.find((d) => d.id === action.id);
      if (!decision || decision.status !== "pending") return state;
      const outcome =
        decision.kind === "accept"
          ? "The offer moves to the next person."
          : decision.kind === "extend"
            ? "It delivers what it has before the deadline, or releases the task."
            : decision.kind === "findwork"
              ? "It stops looking until you tap Work again."
              : "It won't bid on this issue.";
      let next = resolve(state, decision.id, { status: "declined", outcome });
      if (decision.kind === "findwork") {
        next = setAgent(next, decision.agent, { status: "idle", activity: "Standing by" });
        next = { ...next, scoutSearch: "done" };
      }
      return next;
    }
    case "never": {
      const decision = state.decisions.find((d) => d.id === action.id);
      if (!decision || decision.status !== "pending") return state;
      const agent = agentById(decision.agent);
      const after = forbid(agent, state.rules[decision.agent], actOf(decision));
      let next = { ...state, rules: { ...state.rules, [decision.agent]: after } };
      next = resolve(next, decision.id, { status: "never", outcome: `${agent.name} won't ask about this kind again, and Ziki refuses it if it tries.` });
      return withToast(next, `Added a "never" rule for ${agent.name}.`);
    }
    case "answer": {
      const next = {
        ...state,
        questions: state.questions.map((q) => (q.id === action.id ? { ...q, status: "answered", answer: action.text, resolvedAt: Date.now() } : q)),
      };
      return withToast(next, "Answer sent.");
    }
    case "work": {
      const agent = agentById(action.id);
      let next = setAgent(state, action.id, { paused: false });
      if (action.id === "scout" && !state.rules.scout) {
        next = setAgent(next, "scout", { status: "working", activity: "Looking for work in Zedu…" });
        return { ...next, scoutSearch: "searching" };
      }
      next = setAgent(next, action.id, {
        status: next.agents[action.id].status === "idle" ? "working" : next.agents[action.id].status,
        activity: next.agents[action.id].status === "idle" ? "Looking for work inside its rules" : next.agents[action.id].activity,
      });
      return withToast({ ...next, pausedAll: false }, `${agent.name} is working inside its rules.`);
    }
    case "scoutFound": {
      if (state.scoutSearch !== "searching") return state;
      const now = Date.now();
      let next = setAgent(state, "scout", { status: "waiting", activity: "Waiting for your answer" });
      next = {
        ...next,
        scoutSearch: "found",
        decisions: [
          {
            id: `dscout${now}`,
            kind: "findwork",
            agent: "scout",
            created: now,
            fresh: true,
            options: [
              { issue: 820, est: 40, conf: 75, note: "I've fixed this notification router before." },
              { issue: 822, est: 30, conf: 80, note: "Needs an Android build to check." },
              { issue: 821, est: 20, conf: 85, note: "Small and safe." },
            ],
            status: "pending",
          },
          ...next.decisions,
        ],
      };
      return withToast(next, "Ada's Scout found 3 issues it could take. It needs you, because it has no rules yet.", "info");
    }
    case "stop": {
      const agent = agentById(action.id);
      const next = setAgent(state, action.id, { paused: true });
      return withToast(next, `${agent.name} is paused. It keeps any task it holds until its deadline.`);
    }
    case "pauseAll": {
      const agents = Object.fromEntries(Object.entries(state.agents).map(([id, a]) => [id, { ...a, paused: true }]));
      return withToast({ ...state, agents, pausedAll: true, tour: { ...state.tour, pause: true } }, "All your agents are paused.");
    }
    case "resumeAll": {
      const agents = Object.fromEntries(Object.entries(state.agents).map(([id, a]) => [id, { ...a, paused: false }]));
      return withToast({ ...state, agents, pausedAll: false }, "Your agents are back at work, inside their rules.");
    }
    case "saveRules": {
      const agent = agentById(action.id);
      let next = { ...state, rules: { ...state.rules, [action.id]: { ...action.rules, setAgo: "just now" } } };
      const { next: swept, swept: issues } = sweepCovered(next, action.id, null);
      next = swept;
      const extra = issues.length ? ` That also covers #${issues.join(", #")}, so it went ahead.` : "";
      return withToast(next, `Rules saved. ${agent.name} reads them on its next call.${extra}`);
    }
    case "award": {
      return withToast({ ...state, award817: action.bid, tour: { ...state.tour, award: true } }, action.message);
    }
    case "tourSeen": {
      return state.tour[action.step] ? state : { ...state, tour: { ...state.tour, [action.step]: true } };
    }
    case "tourOpen":
      return { ...state, tourOpen: action.open };
    case "dismissToast":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "toast":
      return withToast(state, action.text, action.tone);
    case "reset":
      return { ...initialState(), tourOpen: false };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const scoutTimer = useRef(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toasts: [] }));
    } catch {
      // Storage can be unavailable (private windows); the demo still works without it.
    }
  }, [state]);

  useEffect(() => {
    if (state.scoutSearch === "searching" && !scoutTimer.current) {
      scoutTimer.current = window.setTimeout(() => {
        scoutTimer.current = null;
        dispatch({ type: "scoutFound" });
      }, 2400);
    }
  }, [state.scoutSearch]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export const pendingCount = (state) =>
  state.decisions.filter((d) => d.status === "pending").length + state.questions.filter((q) => q.status === "pending").length;

export { OWNER };
