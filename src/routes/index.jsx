import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Cadastro from '../pages/Despesa/Cadastro';
import Tipo from '../pages/TipoDespesa';
import CadastroTipo from '../pages/TipoDespesa/cadastro';
import { MainLayout } from '../layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from '../pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas: Todas as outras */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/tipo" element={<Tipo />} />
                  <Route path="/cadastroTipo" element={<CadastroTipo />} />
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