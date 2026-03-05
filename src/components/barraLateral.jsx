import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { HiLogout, HiTable, HiChartPie, HiTag, HiUserCircle, HiUsers } from "react-icons/hi";
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
    <Sidebar aria-label="Menu Principal" className="h-screen border-r border-gray-200 flex flex-col">
      <div className="mb-8 px-4 py-2 pt-3">
        <span className="self-center whitespace-nowrap text-xl font-bold text-blue-700 flex items-center gap-2">
          <HiChartPie className="text-2xl" /> 
          Financeiro
        </span>
      </div>
      
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem as={Link} to="/" icon={HiChartPie} className={`transition-all duration-200 ${
              isSelected("/") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Home
          </SidebarItem>
          <SidebarItem as={Link} to="/" icon={HiTable} className={`transition-all duration-200 ${
              isSelected("/despesa") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Despesas
          </SidebarItem>

          <SidebarItem as={Link} to="/tipo" icon={HiTag} className={`transition-all duration-200 ${
              isSelected("/tipo") ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
            }`}>
            Tipos de Despesa
          </SidebarItem>
        </SidebarItemGroup>

        <SidebarItemGroup>
          {userRole === 'ADMIN' && (
            <SidebarItem as={Link} to="/usuarios" icon={HiUsers}>
              Consultar Usuários
            </SidebarItem>
          )}

          {/*
          as={Link} to={`/usuarios/editar/${userId}`} icon={HiUserCircle}
          <SidebarItem as={Link} to="/cadastroUsuario" icon={HiUserCircle}>
          */}
            <SidebarItem as={Link} to={`/usuarios/editar/${userId}`} icon={HiUserCircle}>
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
