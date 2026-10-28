import { useState } from "react";
import { OWNER, PEOPLE, SEV_LABEL, SOLVER_POINTS, issueByNumber } from "../data.js";
import { useStore } from "../store.jsx";
import { A, Avatar, Icon, Modal, Stamp, chipBase, relTime, severityChip, smallPrimary, smallSecondary, useNow } from "../ui.jsx";
import { DecisionCard, QuestionCard } from "./issues.jsx";

const DESCRIPTIONS = {
  812: "When a session expires while the app is open, the client asks for a new token, gets a 401, and asks again in a loop. The network tab fills with refresh calls and the page never recovers until a hard reload.\n\nExpected: one refresh attempt, then a clean redirect to sign in.",
  815: "The desktop sync worker builds its cache key from the user id only. After switching workspace, it serves the previous workspace's channels until the app restarts.\n\nExpected: switching workspace clears or re-keys the cache.",
  817: "Uploading a file larger than 10 MB from mobile web fails with a generic error. Smaller files work. Desktop web is fine with the same file.\n\nSteps: open a chat on a phone browser, attach a 12 MB PDF, send.\n\nExpected: the upload completes, or a clear size limit is shown before upload.",
  818: "Opening Settings on desktop crashes the page when the user's avatar URL is an empty string rather than null.\n\nExpected: fall back to initials, as the web app already does.",
  820: "Tapping a push notification for a message in #design opens #general instead. It happens when the app was in the background for more than a few minutes.",
  821: "After deleting a message while the other person is typing, their typing indicator stays on until the chat is reopened.",
  822: "Voice notes recorded on Android show NaN as their duration in the chat list. iOS shows the right duration.",
  809: "Opening a thread with more than 500 replies freezes the desktop app for several seconds.",
};

const BIDS_817 = [
  {
    id: "b2",
    agent: "Kemi's Claude",
    owner: "Kemi",
    person: PEOPLE.kemi.name,
    basis: "mandate",
    placed: 34,
    note: "Raise the proxy body limit for uploads and move large files to a signed upload URL, with a test at 12 MB.",
    detail: "Kemi's rules: \"Uploads and media fixes\", high and critical in Web and Mobile, until 15 Nov.",
  },
  {
    id: "b1",
    agent: "Tunde's GPT",
    owner: "Tunde",
    person: PEOPLE.tunde.name,
    basis: "explicit",
    placed: 18,
    note: "Stream the upload in 5 MB chunks and retry failed chunks; add a test with a 12 MB file.",
    detail: "Tunde approved this bid himself, 12 minutes ago.",
  },
  {
    id: "b3",
    agent: "Agent Juno",
    owner: "Musa",
    person: PEOPLE.musa.name,
    basis: "none",
    placed: 6,
    note: "Rewrite the attachment service.",
    detail: "No person approved this bid. Musa's project settings only record consent, they don't require it.",
  },
];

const ORDER = { mandate: 0, explicit: 1, none: 2 };

function BidsSection() {
  const { state, dispatch } = useStore();
  const [sort, setSort] = useState("consent");
  const [confirm, setConfirm] = useState(null);
  const bids = [...BIDS_817].sort((a, b) => (sort === "consent" ? ORDER[a.basis] - ORDER[b.basis] : a.placed - b.placed));
  const awarded = state.award817;
  const award = (bid) => {
    const message =
      bid.basis === "mandate"
        ? `Awarded to ${bid.agent}. ${bid.owner}'s rules cover this, so the work starts now.`
        : bid.basis === "explicit"
          ? `Awarded to ${bid.agent}. ${bid.owner} approved this bid, so the work starts now.`
          : `Awarded to ${bid.agent}, with no owner approval on record.`;
    dispatch({ type: "award", bid: bid.id, message });
  };
  return (
    <section className="rounded-[20px] border border-zk-border bg-zk-surface p-5" aria-labelledby="bids-heading">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="bids-heading" className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Bids · {BIDS_817.length}</h2>
          <div role="group" aria-label="Sort bids" className="inline-flex gap-0.5 rounded-full bg-zk-seg p-0.5 text-[11.5px]">
            {[
              ["consent", "Who stands behind it"],
              ["newest", "Newest"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={sort === value}
                onClick={() => setSort(value)}
                className={`rounded-full px-2.5 py-1 font-semibold ${sort === value ? "bg-zk-surface text-zk-text shadow-sm" : "text-zk-text2 hover:text-zk-text"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-zk-muted">A bid doesn't assign the work. Award one to give the agent the task. Each bid shows whether a person stands behind it.</p>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {bids.map((bid) => {
          const isAwarded = awarded === bid.id;
          return (
            <li key={bid.id} className={`flex flex-col gap-2 rounded-[14px] border p-3.5 ${isAwarded ? "border-electric-blue-strong bg-zk-tint" : "border-zk-border bg-zk-surface"} ${awarded && !isAwarded ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-sm font-bold text-zk-text">{bid.agent}</span>
                <Stamp basis={bid.basis} owner={bid.owner} detail={bid.detail} />
              </div>
              <span className="text-xs text-zk-text2">for {bid.person} · {bid.placed} min ago</span>
              <p className="text-[13px] leading-snug text-zk-text2">{bid.note}</p>
              <p className="text-[12px] leading-snug text-zk-muted">{bid.detail}</p>
              {awarded ? (
                <p className={`text-[13px] font-bold ${isAwarded ? "text-zk-accent" : "text-zk-muted"}`}>{isAwarded ? "Awarded" : "Not awarded"}</p>
              ) : (
                <div className="pt-1">
                  <button type="button" className={smallPrimary} onClick={() => (bid.basis === "none" ? setConfirm(bid) : award(bid))}>Award bid</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {confirm ? (
        <Modal title="Award a bid nobody approved?" onClose={() => setConfirm(null)}>
          <p className="text-sm text-zk-text2">
            {confirm.agent} would take this issue in {confirm.person}'s name, but {confirm.owner} hasn't approved the bid and has no rules that cover it. If the fix is late, the claim still counts against {confirm.owner}.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" className={smallSecondary} onClick={() => setConfirm(null)}>Cancel</button>
            <button
              type="button"
              className={smallPrimary}
              onClick={() => {
                award(confirm);
                setConfirm(null);
              }}
            >
              Award anyway
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function StatusBox({ issue, offered }) {
  const statusChip = issue.status === "resolved" ? "bg-zk-ok-bg text-zk-ok-fg" : "bg-zk-info-bg text-zk-info-fg";
  const statusLabel = { open: "Open", in_progress: "In progress", resolved: "Resolved" }[issue.status];
  const stageLabel = { reported: "Idea", confirmed: "Confirmed", ready: "Ready for bids" }[issue.stage];
  const stageChip = { reported: "bg-zk-chip text-zk-text2", confirmed: "bg-zk-ok-bg text-zk-ok-fg", ready: "bg-zk-info-bg text-zk-info-fg" }[issue.stage];
  return (
    <section aria-label="Status" className="flex flex-col gap-2.5 rounded-[20px] border border-zk-border bg-zk-surface px-4 py-3.5">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Status</h2>
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className={`${chipBase} ${statusChip}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {statusLabel}
        </span>
        <span className={`${chipBase} ${severityChip[issue.sev]}`}>{SEV_LABEL[issue.sev]}</span>
        {stageLabel ? <span className={`${chipBase} ${stageChip}`}>{stageLabel}</span> : null}
        {offered ? <span className={`${chipBase} border border-zk-warn-bd bg-zk-warn-bg text-zk-warn-fg`}>Offer held for your agent</span> : null}
      </div>
      <p className="text-xs text-zk-muted">Opened {issue.age} by {PEOPLE[issue.reporter]?.name ?? "someone"}</p>
    </section>
  );
}

function PeopleBox({ issue }) {
  const { state } = useStore();
  const claude = state.tasks.includes(issue.n) && issue.n !== 814;
  const assignee = issue.worker ?? (claude ? OWNER.name : null);
  const basis = issue.n === 812 ? "mandate" : issue.basis ?? (claude ? state.digest.find((g) => g.issue === issue.n && /offer/.test(g.text))?.basis : null);
  return (
    <section className="flex flex-col gap-2 rounded-[20px] border border-zk-border bg-zk-surface px-4 py-3.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">People</span>
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-16 shrink-0 text-xs text-zk-muted">Reporter</span>
        <span className="flex min-w-0 items-center gap-2 text-sm text-zk-text">
          <Avatar name={PEOPLE[issue.reporter]?.name} size="sm" />
          <span className="truncate font-semibold">{PEOPLE[issue.reporter]?.name}</span>
        </span>
      </div>
      <div className="flex min-w-0 items-start gap-3">
        <span className="w-16 shrink-0 pt-0.5 text-xs text-zk-muted">Assignee</span>
        {assignee ? (
          <span className="flex min-w-0 flex-col gap-1 text-sm text-zk-text">
            <span className="flex items-center gap-2">
              <Avatar name={assignee} size="sm" />
              <span className="truncate font-semibold">{assignee}</span>
            </span>
            {issue.n === 812 || claude ? <span className="text-xs text-zk-muted">via Ada's Claude</span> : null}
            {basis ? <Stamp basis={basis} owner={assignee.split(" ")[0]} you={assignee === OWNER.name} size="xs" /> : null}
          </span>
        ) : (
          <span className="text-sm text-zk-muted">Unassigned</span>
        )}
      </div>
    </section>
  );
}

function Conversation({ issue }) {
  const now = useNow(60000);
  const comments =
    issue.n === 817
      ? [
          { who: PEOPLE.tunde.name, at: now - 50 * 60000, text: "Reproduced on Android Chrome with a 12 MB PDF. The proxy returns 413 before the app sees the file." },
          { who: OWNER.name, at: now - 40 * 60000, text: "Thanks. I'd like whoever takes this to add a test with a file over 10 MB." },
        ]
      : [{ who: PEOPLE[issue.reporter]?.name ?? "Someone", at: now - 3 * 3600000, text: "Happy to test a fix on staging when there is one." }];
  return (
    <section id="conversation" className="scroll-mt-24 rounded-[20px] border border-zk-border bg-zk-surface p-5 sm:p-[22px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">
          Conversation <span className="font-mono font-normal normal-case tracking-normal">{comments.length}</span>
        </h2>
      </div>
      <ol className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.text} className="flex gap-3">
            <Avatar name={comment.who} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold text-zk-text">{comment.who}</span> <span className="text-xs text-zk-muted">{relTime(comment.at, now)}</span>
              </p>
              <p className="mt-1 text-sm text-zk-text">{comment.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Activity({ issue }) {
  const { state } = useStore();
  const now = useNow(60000);
  const entries = [
    ...state.digest.filter((g) => g.issue === issue.n).map((g) => ({ at: g.at, text: `${g.agent === "claude" ? "Ada's Claude" : g.agent === "reviewer" ? "Ada's Reviewer" : g.agent === "triager" ? "Ada's Triager" : "Ada's Scout"} ${g.text.charAt(0).toLowerCase()}${g.text.slice(1)}`, basis: g.basis })),
    { at: now - 9 * 3600000, text: "Two reviewers confirmed it as real; a triager cleared it as not a duplicate" },
    { at: now - 11 * 3600000, text: `${PEOPLE[issue.reporter]?.name ?? "Someone"} reported it` },
  ].sort((a, b) => b.at - a.at);
  return (
    <section className="rounded-[20px] border border-zk-border bg-zk-surface p-5">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Activity</h2>
      <ol className="mt-3 space-y-3">
        {entries.map((entry) => (
          <li key={entry.text + entry.at} className="flex gap-2.5 text-[13px]">
            <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zk-border" />
            <span className="min-w-0 flex-1">
              <span className="text-zk-text">{entry.text}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zk-muted">
                {relTime(entry.at, now)}
                {entry.basis ? <Stamp basis={entry.basis} you size="xs" /> : null}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function IssuePage({ number }) {
  const { state } = useStore();
  const now = useNow(1000);
  const issue = issueByNumber(number);
  if (!issue) {
    return (
      <section className="mx-auto max-w-xl rounded-[24px] border border-zk-border bg-zk-surface px-6 py-12 text-center">
        <h1 className="text-2xl font-extrabold text-zk-text">Issue not in this prototype</h1>
        <p className="mt-2 text-sm text-zk-text2">The prototype only has sample issues.</p>
        <A to="/issues" className="mt-4 inline-flex text-sm font-bold text-zk-accent hover:underline">Back to issues</A>
      </section>
    );
  }
  const decisions = state.decisions.filter((d) => d.issue === issue.n || d.options?.some((o) => o.issue === issue.n));
  const questions = state.questions.filter((q) => q.issue === issue.n);
  const offered = state.decisions.some((d) => d.issue === issue.n && d.kind === "accept" && d.status === "pending");
  const description = DESCRIPTIONS[issue.n] ?? "Steps to reproduce, expected and actual behaviour are in the original report.";
  return (
    <div className="issue-detail-scope flex flex-col gap-5 pb-10">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-[1_1_600px] space-y-3">
            <div className="flex items-start gap-2">
              <A to="/issues" aria-label="Back to issues" title="Back to issues" className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zk-accent hover:bg-zk-chip">
                <Icon.Back />
              </A>
              <h1 className="min-w-0 break-words text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-zk-text">
                <span className="font-bold tabular-nums text-zk-muted">#{issue.n}</span> {issue.title}
              </h1>
            </div>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zk-muted">
              <span className={`${chipBase} bg-zk-chip text-zk-text2`}>{issue.type}</span>
              <span className={`${chipBase} bg-zk-chip text-zk-text2`}>{issue.area}</span>
              <span className={`${chipBase} bg-zk-chip text-zk-text2`}>{SOLVER_POINTS[issue.sev].toLocaleString()} pts to the solver</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
            <button type="button" aria-pressed="false" className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zk-border bg-zk-surface px-4 text-sm font-bold text-zk-text transition-all duration-150 hover:bg-zk-chip">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5"><path d="m18 15-6-6-6 6" /></svg>
              <span>Upvote</span> <span className="rounded-full bg-zk-tint px-2 py-0.5 text-xs font-bold tabular-nums text-zk-accent">{issue.votes}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-5">
          {decisions.length || questions.length ? (
            <section aria-label="Waiting on you" className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Your agents and this issue</h2>
              {decisions.map((decision) => <DecisionCard key={decision.id} decision={decision} now={now} />)}
              {questions.map((question) => <QuestionCard key={question.id} question={question} now={now} />)}
            </section>
          ) : null}
          <section className="flex flex-col gap-3.5 rounded-[20px] border border-zk-border bg-zk-surface p-5 sm:p-6" aria-label="Description">
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Description</h2>
            <div className="space-y-3 text-sm leading-relaxed text-zk-text">
              {description.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
          <Conversation issue={issue} />
        </div>
        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
          <StatusBox issue={issue} offered={offered} />
          <PeopleBox issue={issue} />
          {issue.n === 817 ? <BidsSection /> : null}
          <Activity issue={issue} />
        </aside>
      </div>
    </div>
  );
}
