import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Index';
import Despesa from '../pages/Despesa/Index';
import CadastroDespesa from '../pages/Despesa/Cadastro';
import Tipo from '../pages/TipoDespesa/Index';
import CadastroTipo from '../pages/TipoDespesa/Cadastro';
import { MainLayout } from '../layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../pages/Login/Index'
import ConsultaUsuarios from '../pages/Usuarios/Index'
import CadastroUsuario from '../pages/Usuarios/Cadastro';
import Provento from '../pages/Provento/Index';
import CadastroProvento from '../pages/Provento/Cadastro';
import DashboardAnual from '../pages/DashboardAnual/Index';

function App() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');
  
  return (
    <Router>
      <Routes>
        {/* Rota pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas: Todas as outras */}
        <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard-anual" element={<DashboardAnual />} />
                  <Route path="/despesa" element={<Despesa />} />
                  <Route path="/cadastroDespesa" element={<CadastroDespesa />} />
                  <Route path="/tipo" element={<Tipo />} />
                  <Route path="/cadastroTipo" element={<CadastroTipo />} />
                  <Route path="/usuarios" element={<ConsultaUsuarios />} />
                  <Route path="/cadastroUsuario" element={<CadastroUsuario />} />
                  <Route path="/usuarios/editar/:id" element={<CadastroUsuario />} />
                  <Route path="/provento" element={<Provento />} />
                  <Route path="/cadastroProvento" element={<CadastroProvento />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;