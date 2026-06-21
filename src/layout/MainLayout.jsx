import { useState } from "react";
import { HiChartPie, HiMenuAlt2 } from "react-icons/hi";
import { BarraLateral } from "../components/barraLateral";

export function MainLayout({ children }) {
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const fecharMenuMobile = () => setMenuMobileAberto(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <HiChartPie className="text-2xl" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-900">Financeiro</p>
            <p className="text-xs text-slate-500">Menu principal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuMobileAberto(true)}
          aria-label="Abrir menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <HiMenuAlt2 className="text-2xl" />
        </button>
      </header>

      {menuMobileAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={fecharMenuMobile}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 md:translate-x-0 ${
          menuMobileAberto ? "translate-x-0" : "-translate-x-full"
        } ${sidebarAberta ? "w-72" : "w-72 md:w-20"}`}
      >
        <BarraLateral
          aberta={sidebarAberta}
          onToggle={() => setSidebarAberta((aberta) => !aberta)}
          onNavigate={fecharMenuMobile}
          onCloseMobile={fecharMenuMobile}
        />
      </aside>

      <main
        className={`min-h-screen pt-16 transition-all duration-300 md:pt-0 ${
          sidebarAberta ? "md:ml-72" : "md:ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
