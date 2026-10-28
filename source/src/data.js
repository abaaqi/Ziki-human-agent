// Sample data for the Owner Mandates prototype. Everything here is invented
// for the demo; no real Ziki data is used.

export const OWNER = { id: "ada", name: "Ada Okeke", first: "Ada" };
export const WORKSPACE = "Zedu";
export const TIMEZONE = "WAT";

export const PEOPLE = {
  ada: { name: "Ada Okeke" },
  tunde: { name: "Tunde Bello" },
  kemi: { name: "Kemi Adebayo" },
  musa: { name: "Musa Ibrahim" },
  zainab: { name: "Zainab Yusuf" },
};

export const AREAS = ["Web", "Desktop", "Mobile", "Backend"];
export const SEVERITIES = ["low", "medium", "high", "critical"];
export const SEV_RANK = { low: 0, medium: 1, high: 2, critical: 3 };
export const SEV_LABEL = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };
export const SOLVER_POINTS = { low: 450, medium: 750, high: 1200, critical: 1800 };
export const MAX_TASKS = 2;

export const LEVEL_LABEL = {
  observer: "Observer",
  contributor: "Contributor",
  triager: "Triager",
  reviewer: "Reviewer",
};

/** What each action is called in the rules sentence and on the rules page. */
export const ACTIONS = {
  bid: { label: "Bid on issues", verb: "bid on" },
  accept: { label: "Accept offers", verb: "accept" },
  extend: { label: "Use its one deadline extension", verb: "extend deadlines on" },
  file: { label: "File new issues", verb: "file" },
  vote: { label: "Upvote issues", verb: "upvote" },
  review: { label: "Review reports and fixes", verb: "review reports and fixes" },
  triage: { label: "Check reports for duplicates", verb: "check reports for duplicates" },
};

export const LEVEL_ACTIONS = {
  contributor: ["bid", "accept", "extend", "file", "vote"],
  reviewer: ["review"],
  triager: ["triage"],
};

export const ISSUES = [
  { n: 822, title: "Voice note duration shows NaN on Android", sev: "medium", area: "Mobile", type: "Bug", status: "open", stage: "ready", votes: 4, comments: 2, age: "3h ago", reporter: "kemi" },
  { n: 821, title: "Typing indicator never clears after a message is deleted", sev: "low", area: "Mobile", type: "Bug", status: "open", stage: "ready", votes: 3, comments: 1, age: "5h ago", reporter: "musa" },
  { n: 820, title: "Push notifications open the wrong chat", sev: "medium", area: "Mobile", type: "Bug", status: "open", stage: "ready", votes: 6, comments: 4, age: "6h ago", reporter: "tunde" },
  { n: 819, title: "Workspace switcher lists archived workspaces", sev: "low", area: "Web", type: "Bug", status: "open", stage: "confirmed", votes: 2, comments: 0, age: "8h ago", reporter: "zainab", bots: 2 },
  { n: 818, title: "Settings page crashes when the avatar URL is empty", sev: "medium", area: "Desktop", type: "Bug", status: "open", stage: "ready", votes: 5, comments: 3, age: "9h ago", reporter: "musa" },
  { n: 817, title: "Attachment upload fails over 10 MB on mobile web", sev: "high", area: "Web", type: "Bug", status: "open", stage: "ready", votes: 7, comments: 5, age: "11h ago", reporter: "ada" },
  { n: 816, title: "Search results flicker while typing", sev: "low", area: "Web", type: "Improvement", status: "open", stage: "reported", votes: 1, comments: 0, age: "12h ago", reporter: "kemi" },
  { n: 815, title: "Sync worker reuses a stale cache key", sev: "medium", area: "Desktop", type: "Bug", status: "open", stage: "ready", votes: 4, comments: 2, age: "14h ago", reporter: "zainab" },
  { n: 814, title: "Billing page shows the wrong currency for NGN plans", sev: "high", area: "Web", type: "Bug", status: "in_progress", stage: "ready", votes: 9, comments: 6, age: "1d ago", reporter: "kemi", worker: "Tunde Bello", sinceMin: 95, basis: "explicit" },
  { n: 812, title: "Login token refresh loops on expired sessions", sev: "high", area: "Web", type: "Bug", status: "in_progress", stage: "ready", votes: 11, comments: 7, age: "1d ago", reporter: "tunde", worker: "Ada Okeke", sinceMin: 38, basis: "mandate" },
  { n: 811, title: "Channel mentions don't notify mobile users", sev: "high", area: "Mobile", type: "Bug", status: "open", stage: "confirmed", votes: 2, comments: 3, age: "1d ago", reporter: "musa", bots: 2 },
  { n: 810, title: "Dark mode setting resets on reload", sev: "low", area: "Web", type: "Bug", status: "resolved", stage: null, votes: 5, comments: 4, age: "2d ago", reporter: "zainab" },
  { n: 809, title: "App freezes when opening a large thread", sev: "medium", area: "Desktop", type: "Bug", status: "open", stage: "reported", votes: 1, comments: 2, age: "2d ago", reporter: "tunde" },
  { n: 808, title: "Read receipts double-count in group chats", sev: "medium", area: "Backend", type: "Bug", status: "resolved", stage: null, votes: 6, comments: 5, age: "3d ago", reporter: "kemi" },
];

export const issueByNumber = (n) => ISSUES.find((issue) => issue.n === Number(n));

export const AGENTS = [
  {
    id: "claude",
    name: "Ada's Claude",
    model: "Claude",
    level: "contributor",
    status: "working",
    activity: "Working on #812 Login token refresh loops on expired sessions",
    done: "Last 30 days: 3 fixes merged · 11 bids",
    weekPoints: 750,
    lastSeen: "1 min ago",
    added: "12 Oct 2026",
    usual: ["Web", "Desktop"],
  },
  {
    id: "reviewer",
    name: "Ada's Reviewer",
    model: "GPT",
    level: "reviewer",
    status: "working",
    activity: "Reviewing the fix for #810",
    done: "Last 30 days: 14 confirmed · 3 rejected · 6 fixes reviewed",
    weekPoints: 270,
    lastSeen: "4 min ago",
    added: "14 Oct 2026",
    usual: ["Web", "Desktop"],
  },
  {
    id: "triager",
    name: "Ada's Triager",
    model: "Claude",
    level: "triager",
    status: "idle",
    activity: "Standing by",
    done: "Last 30 days: 22 duplicates cleared",
    weekPoints: 90,
    lastSeen: "26 min ago",
    added: "15 Oct 2026",
    usual: AREAS,
  },
  {
    id: "scout",
    name: "Ada's Scout",
    model: "Gemini",
    level: "contributor",
    status: "idle",
    activity: "Standing by: no rules yet, so it asks you first",
    done: "Nothing done in the last 30 days",
    weekPoints: 0,
    lastSeen: "2 h ago",
    added: "20 Oct 2026",
    usual: ["Mobile"],
  },
];

export const agentById = (id) => AGENTS.find((agent) => agent.id === id);

function inDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const DEFAULT_HOURS = { from: "06:00", to: "23:59" };

export const INITIAL_RULES = {
  claude: {
    name: "High-severity web fixes",
    actions: ["bid", "accept"],
    minSeverity: "high",
    areas: ["Web"],
    limits: { bid: 3, file: 0, review: 0, triage: 0 },
    maxTasks: 1,
    hours: { ...DEFAULT_HOURS },
    until: inDays(33),
    outside: "ask",
    never: [{ action: "vote" }],
    paused: false,
    setAgo: "16 days ago",
  },
  reviewer: {
    name: "Reviews in Web and Desktop",
    actions: ["review"],
    minSeverity: "low",
    areas: ["Web", "Desktop"],
    limits: { bid: 0, file: 0, review: 15, triage: 0 },
    maxTasks: 1,
    hours: { ...DEFAULT_HOURS },
    until: inDays(40),
    outside: "ask",
    never: [],
    paused: false,
    setAgo: "14 days ago",
  },
  triager: {
    name: "Duplicate checks everywhere",
    actions: ["triage"],
    minSeverity: "low",
    areas: [...AREAS],
    limits: { bid: 0, file: 0, review: 0, triage: 20 },
    maxTasks: 1,
    hours: { from: "00:00", to: "23:59" },
    until: inDays(45),
    outside: "ask",
    never: [],
    paused: false,
    setAgo: "13 days ago",
  },
  scout: null,
};

export const TEMPLATES = [
  {
    id: "cautious",
    name: "Cautious",
    blurb: "Asks you about everything.",
    make: () => ({ actions: [], minSeverity: "high", areas: [], limits: { bid: 0, file: 0 }, maxTasks: 1, never: [] }),
  },
  {
    id: "reporter",
    name: "Reporter",
    blurb: "Files up to 10 issues a day, never bids.",
    make: () => ({ actions: ["file"], minSeverity: "low", areas: [...AREAS], limits: { bid: 0, file: 10 }, maxTasks: 1, never: [] }),
  },
  {
    id: "fixer",
    name: "Fixer",
    blurb: "Bids on high and critical issues in its areas; asks before taking an offer.",
    make: (agent) => ({ actions: ["bid"], minSeverity: "high", areas: [...agent.usual], limits: { bid: 3, file: 0 }, maxTasks: 1, never: [{ action: "vote" }] }),
  },
  {
    id: "trusted",
    name: "Trusted",
    blurb: "Bids and takes offers in its areas, one task at a time, in your hours.",
    make: (agent) => ({ actions: ["bid", "accept", "extend"], minSeverity: "medium", areas: [...agent.usual], limits: { bid: 5, file: 0 }, maxTasks: 1, never: [{ action: "vote" }] }),
  },
];

export function newRulesFor(agent, partial = {}) {
  return {
    name: "My rules",
    actions: [],
    minSeverity: "high",
    areas: [...agent.usual],
    limits: { bid: 3, file: 0, review: 15, triage: 20 },
    maxTasks: 1,
    hours: { ...DEFAULT_HOURS },
    until: inDays(30),
    outside: "ask",
    never: [],
    paused: false,
    setAgo: "just now",
    ...partial,
  };
}

const SEV_PHRASE = { low: "any", medium: "medium or higher", high: "high or critical", critical: "critical" };

export function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function areaPhrase(areas) {
  if (areas.length === 0) return "no area";
  if (areas.length === AREAS.length) return "any area";
  return joinList(areas);
}

export function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${d} ${month}${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
}

function hoursPhrase(hours) {
  if (hours.from === "00:00" && hours.to === "23:59") return "at any hour";
  return `${hours.from}–${hours.to} ${TIMEZONE}`;
}

/**
 * The rules as clauses of one sentence, each with a short label saying which
 * part of the rules it comes from.
 */
export function ruleClauses(agent, rules) {
  if (!rules || (rules.actions.length === 0 && agent.level === "contributor" && !(rules.limits?.file > 0))) {
    return [
      { text: agent.name, label: "agent" },
      { text: rules ? "may not act on its own yet," : "has no rules yet,", label: "may" },
      { text: `so it asks ${OWNER.first} before every bid, offer and report.`, label: "outside these rules" },
    ];
  }
  const clauses = [{ text: agent.name, label: "agent" }];
  const scoped = rules.actions.filter((a) => a !== "file" && a !== "vote");
  if (agent.level === "contributor") {
    if (scoped.length > 0) {
      clauses.push({ text: `may ${joinList(scoped.map((a) => ACTIONS[a].verb))}`, label: "may" });
      clauses.push({ text: `${SEV_PHRASE[rules.minSeverity]} issues in ${areaPhrase(rules.areas)},`, label: "which issues" });
      const parts = [];
      if (rules.actions.includes("bid")) parts.push(`at most ${rules.limits.bid} ${rules.limits.bid === 1 ? "bid" : "bids"} a day`);
      parts.push(`${rules.maxTasks} ${rules.maxTasks === 1 ? "task" : "tasks"} at a time`);
      clauses.push({ text: `${joinList(parts)},`, label: "how much" });
    } else {
      clauses.push({ text: "may not bid or take work,", label: "may" });
    }
    if (rules.actions.includes("file")) {
      clauses.push({ text: `may file up to ${rules.limits.file} issues a day,`, label: "reports" });
    }
  } else {
    const verb = agent.level === "reviewer" ? "may review reports and fixes" : "may check reports for duplicates";
    clauses.push({ text: verb, label: "may" });
    clauses.push({ text: `in ${areaPhrase(rules.areas)},`, label: "which issues" });
    const n = agent.level === "reviewer" ? rules.limits.review : rules.limits.triage;
    clauses.push({ text: `at most ${n} a day,`, label: "how much" });
  }
  clauses.push({ text: `${hoursPhrase(rules.hours)},`, label: "when" });
  clauses.push({ text: `until ${formatDate(rules.until)}.`, label: "until" });
  const never = neverPhrase(rules.never);
  if (never) clauses.push({ text: never, label: "never" });
  clauses.push({
    text: rules.outside === "ask" ? `Ask ${OWNER.first} about anything else.` : "Skip anything else without asking.",
    label: "outside these rules",
  });
  return clauses;
}

export const ruleSentence = (agent, rules) => ruleClauses(agent, rules).map((c) => c.text).join(" ");

/** One line for lists and panels. */
export function ruleSummary(agent, rules) {
  if (!rules) return "No rules yet: asks you first";
  if (rules.paused) return `Paused · ${rules.name}`;
  return `${rules.name} · until ${formatDate(rules.until)}`;
}

function minutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function inHours(hours, hour) {
  const t = hour * 60 + 30;
  const from = minutes(hours.from);
  const to = minutes(hours.to);
  return from <= to ? t >= from && t <= to : t >= from || t <= to;
}

/**
 * "Never" rules: an action everywhere ({ action: "vote" }) or taking work in
 * one area ({ action: "take", area: "Desktop" }, which covers bids and offers).
 */
export function neverBlocks(never, act) {
  return never.some((rule) => {
    if (rule.area) return rule.area === act.area && (act.action === "bid" || act.action === "accept");
    return rule.action === act.action;
  });
}

export function neverPhrase(never) {
  if (!never || never.length === 0) return "";
  const plain = never.filter((rule) => !rule.area).map((rule) => ACTIONS[rule.action].verb);
  const areas = never.filter((rule) => rule.area).map((rule) => rule.area);
  const parts = [];
  if (plain.length) parts.push(joinList(plain));
  if (areas.length) parts.push(`take ${joinList(areas)} work`);
  return `Never ${parts.join(" or ")}.`;
}

export function neverLabel(rule) {
  return rule.area ? `Take ${rule.area} work` : ACTIONS[rule.action].label;
}

/** Would these rules let the agent take this action without asking? */
export function covers(rules, act) {
  if (!rules || rules.paused) return false;
  if (neverBlocks(rules.never, act)) return false;
  if (!rules.actions.includes(act.action)) return false;
  if (act.action !== "file" && act.action !== "vote") {
    if (SEV_RANK[act.sev] < SEV_RANK[rules.minSeverity]) return false;
    if (!rules.areas.includes(act.area)) return false;
  }
  return inHours(rules.hours, act.hour);
}

/** Why an action falls outside the rules, in the agent's words. */
export function reasonsOutside(rules, act) {
  if (!rules) return ["I have no rules yet"];
  const reasons = [];
  if (rules.paused) reasons.push("You paused me");
  if (neverBlocks(rules.never, act)) reasons.push("A \"never\" rule covers it");
  if (!rules.actions.includes(act.action)) reasons.push(`My rules don't let me ${ACTIONS[act.action].verb.replace(/ on$/, "")}`);
  if (act.area && !rules.areas.includes(act.area)) reasons.push(`${act.area} isn't in my rules`);
  if (act.sev && SEV_RANK[act.sev] < SEV_RANK[rules.minSeverity]) {
    reasons.push(`${SEV_LABEL[act.sev]} is below my ${SEV_LABEL[rules.minSeverity].toLowerCase()} floor`);
  }
  return reasons;
}

// A small seeded generator, so the sample history is the same on every visit.
function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, weighted) {
  const total = weighted.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, w] of weighted) {
    r -= w;
    if (r <= 0) return value;
  }
  return weighted[weighted.length - 1][0];
}

function history(seed, count, mix) {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    action: pick(rand, mix.actions),
    sev: pick(rand, mix.sev),
    area: pick(rand, mix.area),
    hour: pick(rand, mix.hour),
  }));
}

const DAY_HOURS = [
  [8, 2], [9, 3], [10, 4], [11, 4], [12, 3], [13, 3], [14, 4], [15, 4], [16, 3], [17, 3], [18, 2], [19, 2], [20, 2], [21, 2], [22, 1], [23, 1], [2, 1], [3, 1],
];

/** What each agent did, or asked to do, over the last 7 days. */
export const HISTORY = {
  claude: history(11, 47, {
    actions: [["bid", 30], ["accept", 12], ["extend", 3], ["file", 2]],
    sev: [["critical", 3], ["high", 20], ["medium", 10], ["low", 2]],
    area: [["Web", 26], ["Desktop", 12], ["Mobile", 5], ["Backend", 3]],
    hour: DAY_HOURS,
  }),
  reviewer: history(23, 34, {
    actions: [["review", 1]],
    sev: [["high", 8], ["medium", 10], ["low", 6]],
    area: [["Web", 14], ["Desktop", 10], ["Mobile", 6], ["Backend", 4]],
    hour: DAY_HOURS,
  }),
  triager: history(37, 29, {
    actions: [["triage", 1]],
    sev: [["high", 6], ["medium", 10], ["low", 8]],
    area: [["Web", 10], ["Desktop", 8], ["Mobile", 8], ["Backend", 3]],
    hour: DAY_HOURS,
  }),
  scout: history(5, 9, {
    actions: [["bid", 4], ["accept", 5]],
    sev: [["high", 3], ["medium", 5], ["low", 1]],
    area: [["Mobile", 8], ["Web", 1]],
    hour: [[10, 2], [14, 3], [16, 2], [19, 2], [22, 1]],
  }),
};

export function coverage(rules, agentId) {
  const acts = HISTORY[agentId] ?? [];
  const covered = acts.filter((act) => covers(rules, act)).length;
  return { total: acts.length, covered, asked: acts.length - covered };
}

/** Ada's Scout this week, for "why isn't it earning?". */
export const SCOUT_WEEK = { requests: 9, answered: 2, expired: 7, offersExpired: 5 };

const SEV_SHORT = { low: "any severity", medium: "medium and up", high: "high and critical", critical: "critical only" };

/** A plain name for rules that were just widened from a decision. */
export function autoName(agent, rules) {
  if (agent.level === "reviewer") return `Reviews in ${areaPhrase(rules.areas)}`;
  if (agent.level === "triager") return `Duplicate checks in ${areaPhrase(rules.areas)}`;
  return `${areaPhrase(rules.areas)} fixes, ${SEV_SHORT[rules.minSeverity]}`;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

/**
 * "Always allow this kind": the smallest change to the rules that covers the
 * action. Taking work (a bid or an offer) allows both, since they are one job.
 */
export function widen(agent, rules, act) {
  const next = rules ? clone(rules) : newRulesFor(agent, { actions: [] });
  const wanted = act.action === "bid" || act.action === "accept" ? ["bid", "accept"] : [act.action];
  for (const action of wanted) if (!next.actions.includes(action)) next.actions.push(action);
  if (act.area && !next.areas.includes(act.area)) next.areas.push(act.area);
  if (act.sev && SEV_RANK[act.sev] < SEV_RANK[next.minSeverity]) next.minSeverity = act.sev;
  next.never = next.never.filter((rule) => !(rule.area && rule.area === act.area) && rule.action !== act.action);
  if (wanted.includes("bid") && !(next.limits.bid > 0)) next.limits.bid = 3;
  next.name = autoName(agent, next);
  next.setAgo = "just now";
  return next;
}

/** "Never allow this kind": a never rule for the action's area, or the action itself. */
export function forbid(agent, rules, act) {
  const next = rules ? clone(rules) : newRulesFor(agent, { actions: [] });
  const rule = (act.action === "bid" || act.action === "accept") && act.area ? { action: "take", area: act.area } : { action: act.action };
  if (!next.never.some((r) => r.action === rule.action && r.area === rule.area)) next.never.push(rule);
  next.setAgo = "just now";
  return next;
}

/** What changed between two sets of rules, in words. */
export function ruleChanges(before, after) {
  const changes = [];
  if (!before) return ["Gives it its first rules"];
  for (const action of after.actions) if (!before.actions.includes(action)) changes.push(`Lets it ${ACTIONS[action].verb.replace(/ on$/, "")}`);
  for (const area of after.areas) if (!before.areas.includes(area)) changes.push(`Adds ${area}`);
  if (after.minSeverity !== before.minSeverity) {
    changes.push(`Lowers the floor from ${SEV_LABEL[before.minSeverity].toLowerCase()} to ${SEV_LABEL[after.minSeverity].toLowerCase()}`);
  }
  for (const rule of after.never) {
    if (!before.never.some((r) => r.action === rule.action && r.area === rule.area)) changes.push(`Adds a never rule: ${neverLabel(rule).toLowerCase()}`);
  }
  for (const rule of before.never) {
    if (!after.never.some((r) => r.action === rule.action && r.area === rule.area)) changes.push(`Removes a never rule: ${neverLabel(rule).toLowerCase()}`);
  }
  return changes;
}
