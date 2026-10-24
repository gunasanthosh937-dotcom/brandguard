import { NavLink, Outlet } from "react-router-dom";
const links = [["/", "Dashboard"], ["/check", "Content Checker"], ["/guidelines", "Brand Guidelines"], ["/visual", "Visual Checker"], ["/history", "Analysis History"], ["/review", "Review Queue"], ["/analytics", "Analytics"], ["/alerts", "Alerts"]];
export default function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-ink p-4 text-white md:w-60 md:shrink-0">
        <div className="mb-1 text-lg font-semibold">BrandGuard</div>
        <div className="mb-4 text-xs text-slate-300">Brand trust platform</div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm ${isActive ? "bg-brand" : "hover:bg-white/10"}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-900">
          Demo mode — sample data. Set VITE_API_URL to connect the FastAPI backend.
        </div>
        <main className="mx-auto max-w-5xl p-6"><Outlet /></main>
      </div>
    </div>
  );
}
