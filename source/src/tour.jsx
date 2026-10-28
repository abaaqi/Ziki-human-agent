import { useStore } from "./store.jsx";
import { A, Icon, linkFocus } from "./ui.jsx";

const STEPS = [
  { key: "allow", title: "Answer Ada's Claude about #815 with \"Always allow this kind\"", hint: "See the exact rule change, and watch #818 go ahead on its own.", to: "/issues" },
  { key: "scout", title: "Tap Work on Ada's Scout, then take an issue it finds", hint: "It comes back with options and tells you what each would commit you to.", to: "/issues?agent=scout" },
  { key: "why", title: "Find out why Ada's Scout earned nothing this week", hint: "Dashboard, then Why?", to: "/dashboard" },
  { key: "award", title: "Award a bid on #817, looking at who stands behind each one", hint: "You reported #817, so you choose who fixes it.", to: "/issues/817" },
  { key: "pause", title: "Pause all your agents, then resume them", hint: "One switch, in the Your agents panel.", to: "/issues" },
];

export function Tour() {
  const { state, dispatch } = useStore();
  const done = STEPS.filter((step) => state.tour[step.key]).length;
  if (!state.tourOpen) {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: "tourOpen", open: true })}
        className={`fixed bottom-24 right-3 z-[55] inline-flex h-10 items-center gap-2 rounded-full border border-zk-border bg-zk-surface px-4 text-[13px] font-bold text-zk-text shadow-[0_12px_32px_rgba(11,23,51,0.18)] hover:bg-zk-chip lg:bottom-6 lg:right-6 ${linkFocus}`}
      >
        <Icon.Route size={15} className="text-zk-accent" /> {done === 0 ? "Start here: 2-minute walkthrough" : "Walkthrough"} <span className="tabular-nums text-zk-muted">{done}/{STEPS.length}</span>
      </button>
    );
  }
  return (
    <aside aria-label="Walkthrough" className="fixed bottom-24 right-3 z-[55] w-[min(23rem,calc(100vw-1.5rem))] rounded-[20px] border border-zk-border bg-zk-surface p-4 text-zk-text shadow-[0_24px_56px_rgba(11,23,51,0.22)] lg:bottom-6 lg:right-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">Try the interaction</p>
          <p className="text-xs text-zk-muted">
            <span className="tabular-nums">{done} of {STEPS.length}</span> done · about two minutes
          </p>
        </div>
        <button type="button" onClick={() => dispatch({ type: "tourOpen", open: false })} aria-label="Hide the walkthrough" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zk-chip text-zk-text hover:bg-zk-tint">
          <Icon.ChevronDown />
        </button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zk-seg" aria-hidden="true">
        <div className="h-full rounded-full bg-electric-blue-strong transition-[width] duration-300" style={{ width: `${(done / STEPS.length) * 100}%` }} />
      </div>
      <ol className="mt-3 space-y-2.5">
        {STEPS.map((step, index) => {
          const complete = state.tour[step.key];
          return (
            <li key={step.key} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${complete ? "bg-zk-ok-bg text-zk-ok-fg" : "bg-zk-tint text-zk-accent"}`}
              >
                {complete ? <Icon.Check size={13} /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold leading-snug ${complete ? "text-zk-muted line-through decoration-zk-muted/60" : "text-zk-text"}`}>
                  {step.title}
                  {complete ? <span className="sr-only"> (done)</span> : null}
                </p>
                <p className="text-xs text-zk-muted">{step.hint}</p>
              </div>
              {!complete ? (
                <A to={step.to} className={`h-7 shrink-0 self-start rounded-full border border-zk-border px-2.5 text-xs font-bold leading-[26px] text-zk-accent hover:bg-zk-tint ${linkFocus}`}>Go</A>
              ) : null}
            </li>
          );
        })}
      </ol>
      {done === STEPS.length ? (
        <p className="mt-3 rounded-xl bg-zk-ok-bg px-3 py-2 text-[13px] font-semibold text-zk-ok-fg">
          That's the whole loop. <A to="/proposal" className="underline">Read why it exists</A>, or use Reset in the top bar to start again.
        </p>
      ) : null}
    </aside>
  );
}
