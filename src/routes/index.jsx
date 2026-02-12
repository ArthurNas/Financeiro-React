import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Cadastro from '../pages/Despesa/Cadastro';
import Tipo from '../pages/TipoDespesa';
import CadastroTipo from '../pages/TipoDespesa/cadastro';
import { MainLayout } from '../layout/MainLayout';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/tipo" element={<Tipo />} />
          <Route path="/cadastroTipo" element={<CadastroTipo />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;