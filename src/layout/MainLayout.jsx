import { BarraLateral } from "../components/barraLateral";

export function MainLayout({ children }) {
  return (
    <div className="flex">
      {/* Barra lateral fixa */}
      <div className="w-64 fixed h-full">
        <BarraLateral />
      </div>
      
      {/* Conteúdo das páginas que "empurra" para a direita */}
      <main className="flex-1 ml-64 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}