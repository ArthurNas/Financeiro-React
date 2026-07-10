import { useContext } from 'react';
import {
  HiCash,
  HiChartBar,
  HiChartPie,
  HiChevronLeft,
  HiChevronRight,
  HiLogout,
  HiTable,
  HiTag,
  HiTrendingUp,
  HiUserCircle,
  HiUsers,
  HiX,
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from './AuthContext';

const menuPrincipal = [
  { label: "Dashboard Mensal", path: "/", icon: HiChartPie },
  { label: "Dashboard Anual", path: "/dashboard-anual", icon: HiChartBar },
  { label: "Despesas", path: "/despesa", icon: HiTable },
  { label: "Tipos de Despesa", path: "/tipo", icon: HiTag },
  { label: "Proventos", path: "/provento", icon: HiTrendingUp },
  { label: "Orçamento", path: "/orcamento", icon: HiChartBar },
  { label: "Aportes", path: "/aporte", icon: HiCash },
];

function NavItem({ item, selected, aberta, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      title={!aberta ? item.label : undefined}
      className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all ${
        selected
          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      } ${aberta ? "justify-start" : "justify-center md:px-0"}`}
    >
      <Icon className={`shrink-0 text-xl ${selected ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
      <span className={`truncate transition-opacity ${aberta ? "opacity-100" : "md:hidden"}`}>
        {item.label}
      </span>
    </Link>
  );
}

export function BarraLateral({ aberta, onToggle, onNavigate, onCloseMobile }) {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const perfilPath = `/usuarios/editar/${user?.id}`;
  const usuarioTeste = user?.role === 'TESTE';
  const isSelected = (path) => location.pathname === path;
  const isProfileSelected = () => location.pathname.startsWith("/usuarios/editar/");

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  return (
    <div className="flex h-screen flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:shadow-none">
      <div className={`relative flex h-20 items-center border-b border-slate-100 px-4 ${aberta ? "justify-between" : "md:justify-center"}`}>
        <div className={`flex min-w-0 items-center gap-3 ${aberta ? "" : "md:hidden"}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <HiChartPie className="text-2xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">Financeiro</p>
            <p className="truncate text-xs text-slate-500">Controle pessoal</p>
          </div>
        </div>

        {!aberta && (
          <span className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200 md:flex">
            <HiChartPie className="text-2xl" />
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-label={aberta ? "Recolher menu" : "Expandir menu"}
            className={`hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 md:inline-flex ${
              aberta ? "" : "absolute -right-4 top-1/2 -translate-y-1/2"
            }`}
          >
            {aberta ? <HiChevronLeft className="text-xl" /> : <HiChevronRight className="text-xl" />}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            <HiX className="text-xl" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuPrincipal.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            selected={isSelected(item.path)}
            aberta={aberta}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        {user?.role === 'ADMIN' && (
          <NavItem
            item={{ label: "Consultar Usuários", path: "/usuarios", icon: HiUsers }}
            selected={isSelected("/usuarios")}
            aberta={aberta}
            onNavigate={onNavigate}
          />
        )}

        {!usuarioTeste && (
          <NavItem
            item={{ label: "Meu Perfil", path: perfilPath, icon: HiUserCircle }}
            selected={isProfileSelected()}
            aberta={aberta}
            onNavigate={onNavigate}
          />
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={!aberta ? "Sair do Sistema" : undefined}
          className={`group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 ${
            aberta ? "justify-start" : "justify-center md:px-0"
          }`}
        >
          <HiLogout className="shrink-0 text-xl text-red-500" />
          <span className={`truncate transition-opacity ${aberta ? "opacity-100" : "md:hidden"}`}>
            Sair do Sistema
          </span>
        </button>
      </div>
    </div>
  );
}
