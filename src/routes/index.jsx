import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Cadastro from '../pages/Despesa/Cadastro';
import Tipo from '../pages/TipoDespesa';
import CadastroTipo from '../pages/TipoDespesa/cadastro';
import { MainLayout } from '../layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../pages/Login'
import ConsultaUsuarios from '../pages/Usuarios'
import CadastroUsuario from '../pages/Usuarios/cadastro';

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
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/tipo" element={<Tipo />} />
                  <Route path="/cadastroTipo" element={<CadastroTipo />} />
                  <Route path="/usuarios" element={userRole === 'ADMIN' ? <ConsultaUsuarios /> : <Navigate to="/" />} />
                  <Route path="/cadastroUsuario" element={<CadastroUsuario />} />
                  <Route path="/usuarios/editar/:id" element={<CadastroUsuario />} />
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