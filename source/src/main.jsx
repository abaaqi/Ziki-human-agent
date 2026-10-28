import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./store.jsx";
import { AppHeader, PrototypeBar, applyTheme } from "./header.jsx";
import { Toasts, navigate } from "./ui.jsx";
import { Tour } from "./tour.jsx";
import { IssuesPage } from "./pages/issues.jsx";
import { IssuePage } from "./pages/issue.jsx";
import { DashboardPage } from "./pages/dashboard.jsx";
import { AgentsPage } from "./pages/agents.jsx";
import { RulesPage } from "./pages/rules.jsx";
import { MarketingPage, NotFound, SecurityPage } from "./pages/simple.jsx";
import { ProposalPage } from "./pages/proposal.jsx";
import { agentById } from "./data.js";

function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/issues";
  const [pathPart, queryPart = ""] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return { path: path.replace(/\/+$/, "") || "/", query: new URLSearchParams(queryPart) };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function resolve({ path, query }) {
  if (path === "/" || path === "/issues") return { title: "Issues", page: <IssuesPage query={query} /> };
  let match = path.match(/^\/issues\/(\d+)$/);
  if (match) return { title: `#${match[1]}`, page: <IssuePage number={match[1]} /> };
  if (path === "/dashboard") return { title: "Dashboard", page: <DashboardPage /> };
  if (path === "/settings/agents") return { title: "My agents", page: <AgentsPage /> };
  match = path.match(/^\/settings\/agents\/([a-z]+)\/rules$/);
  if (match) return { title: `Rules for ${agentById(match[1])?.name ?? "agent"}`, page: <RulesPage agentId={match[1]} /> };
  if (path === "/marketing") return { title: "Marketing", page: <MarketingPage /> };
  if (path === "/security") return { title: "Security", page: <SecurityPage /> };
  if (path === "/proposal") return { title: "Owner Mandates", page: <ProposalPage /> };
  return { title: "Not in the prototype", page: <NotFound /> };
}

function App() {
  const route = useHashRoute();
  const { title, page } = resolve(route);

  useEffect(() => {
    document.title = `${title} · Ziki prototype`;
  }, [title]);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", "#/issues");
  }, []);

  return (
    <div data-app-shell="" className="flex min-h-screen flex-col bg-zk-bg">
      <button
        type="button"
        onClick={() => document.getElementById("main-content")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-electric-blue-strong focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </button>
      <PrototypeBar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader path={route.path} />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full min-w-0 max-w-6xl flex-1 overflow-x-clip px-4 py-6 outline-none max-lg:pb-28 max-sm:px-2 max-sm:pt-2.5 sm:px-6 sm:py-8 max-lg:sm:pb-28"
        >
          {page}
        </main>
      </div>
      <Tour />
      <Toasts />
    </div>
  );
}

try {
  applyTheme(window.localStorage.getItem("zm-theme") || "system");
} catch {
  // No stored theme; the system setting applies.
}

window.zmNavigate = navigate;
createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
