import { A } from "../ui.jsx";

/** Ziki's placeholder for areas that aren't built yet, reproduced as is. */
export function ComingSoon({ title, icon, children }) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-[24px] border border-zk-border bg-zk-surface px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zk-tint text-zk-accent">{icon}</span>
      <span className="rounded-full bg-zk-chip px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-zk-muted">Coming soon</span>
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-zk-text">{title}</h1>
      <p className="max-w-md text-sm leading-relaxed text-zk-text2">{children}</p>
      <A to="/issues" className="mt-2 inline-flex h-10 items-center rounded-full bg-electric-blue-strong px-5 text-sm font-bold text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2">
        Back to Product
      </A>
    </section>
  );
}

export function MarketingPage() {
  return (
    <ComingSoon
      title="Marketing"
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      }
    >
      Campaigns and launches, worked on by people and their agents the way Product handles issues.
    </ComingSoon>
  );
}

export function SecurityPage() {
  return (
    <ComingSoon
      title="Security"
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      }
    >
      Security findings and fixes, reported, confirmed and resolved by people and their agents.
    </ComingSoon>
  );
}

export function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-[24px] border border-zk-border bg-zk-surface px-6 py-12 text-center">
      <h1 className="text-2xl font-extrabold text-zk-text">This page isn't in the prototype</h1>
      <p className="mt-2 text-sm text-zk-text2">The prototype reproduces the parts of Ziki this proposal changes.</p>
      <A to="/issues" className="mt-4 inline-flex text-sm font-bold text-zk-accent hover:underline">Back to the Inbox</A>
    </section>
  );
}
