import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { HiLogout, HiTable, HiChartPie, HiTag, HiUserCircle, HiUsers, HiTrendingUp, HiChartBar } from "react-icons/hi";
import { Link, useLocation, Navigate } from "react-router-dom";


export function BarraLateral() {
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');

  // Função simples para verificar se a rota está ativa e mudar a cor
  const isSelected = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };
  
  return (
    <Sidebar aria-label="Menu Principal" className="h-screen border-r border-gray-200">
      <div className="mb-8 px-4 py-2 pt-3">
        <span className="self-center whitespace-nowrap text-xl font-bold text-blue-700 flex items-center gap-2">
          <HiChartPie className="text-2xl" /> 
          Financeiro
        </span>
      </div>
      
      <SidebarItems className="flex flex-col justify-between h-[calc(100vh-120px)]">
        <SidebarItemGroup>
          <SidebarItem as={Link} to="/" icon={HiChartPie} className={`transition-all duration-200 ${
              isSelected("/") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Dashboard Mensal
          </SidebarItem>
          <SidebarItem as={Link} to="/dashboard-anual" icon={HiChartBar} className={`transition-all duration-200 ${
              isSelected("/dashboard-anual") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Dashboard Anual
          </SidebarItem>
          <SidebarItem as={Link} to="/despesa" icon={HiTable} className={`transition-all duration-200 ${
              isSelected("/despesa") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Despesas
          </SidebarItem>

          <SidebarItem as={Link} to="/tipo" icon={HiTag} className={`transition-all duration-200 ${
              isSelected("/tipo") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Tipos de Despesa
          </SidebarItem>

          <SidebarItem as={Link} to="/provento" icon={HiTrendingUp} className={`transition-all duration-200 ${
              isSelected("/provento") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Proventos
          </SidebarItem>
        </SidebarItemGroup>

        <SidebarItemGroup className="mt-auto border-t border-gray-100 pt-4">
          {userRole === 'ADMIN' && (
            <SidebarItem as={Link} to="/usuarios" icon={HiUsers} className={`transition-all duration-200 ${
                isSelected("/usuarios") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
              }`}>
              Consultar Usuários
            </SidebarItem>
          )}

          <SidebarItem as={Link} to={`/usuarios/editar/${userId}`} icon={HiUserCircle} className={`transition-all duration-200 ${
              isSelected("/usuarios/editar/") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Meu Perfil
          </SidebarItem>
          <SidebarItem onClick={handleLogout} icon={HiLogout} className="cursor-pointer text-red-500 hover:bg-red-50">
            Sair do Sistema
          </SidebarItem>
        </SidebarItemGroup>
        
      </SidebarItems>
    </Sidebar>
  );
}
