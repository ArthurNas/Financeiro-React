import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Home from '../pages/Home/Index';
import Despesa from '../pages/Despesa/Index';
import CadastroDespesa from '../pages/Despesa/Cadastro';
import Tipo from '../pages/TipoDespesa/Index';
import CadastroTipo from '../pages/TipoDespesa/Cadastro';
import { MainLayout } from '../layout/MainLayout';
import Login from '../pages/Login/Index';
import ConsultaUsuarios from '../pages/Usuarios/Index';
import CadastroUsuario from '../pages/Usuarios/Cadastro';
import Provento from '../pages/Provento/Index';
import CadastroProvento from '../pages/Provento/Cadastro';
import DashboardAnual from '../pages/DashboardAnual/Index';
import AcessoNegado from '../pages/AcessoNegado/Index';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/acesso-negado" element={<AcessoNegado />} />

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
                  <Route path="/provento" element={<Provento />} />
                  <Route path="/cadastroProvento" element={<CadastroProvento />} />

                  <Route
                    path="/usuarios"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <ConsultaUsuarios />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cadastroUsuario"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <CadastroUsuario />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/usuarios/editar/:id"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <CadastroUsuario />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
