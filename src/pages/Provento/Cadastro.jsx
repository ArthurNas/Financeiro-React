import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import proventoService from '../../service/proventoService';
import InputMoeda from '../../components/InputMoeda';
import MessageModal from '../../components/messageModal';

const INITIAL_STATE = {
  id: '',
  descricao: '',
  valor: '',
  data: new Date().toISOString().split('T')[0],
};

function CadastroProvento() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editando = !!state?.provento;
  const [salvando, setSalvando] = useState(false);
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'error', message: '' });
  const [formData, setFormData] = useState(
    editando
      ? {
          id: state.provento.id || '',
          descricao: state.provento.descricao || '',
          valor: state.provento.valor || '',
          data: state.provento.data || new Date().toISOString().split('T')[0],
        }
      : { ...INITIAL_STATE }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);

    const dadosParaEnviar = {
      ...formData,
      valor: parseFloat(formData.valor),
    };

    try {
      await proventoService.salvar(dadosParaEnviar);
      
      if (editando){
        navigate('/provento');
      } else{
        showBanner("success", "Provento registrado com sucesso!");
        setFormData({ ...INITIAL_STATE });
      }
    } catch (error) {
      setModal({
        open: true,
        type: "error",
        message: (error.response?.data || error.message),
      });
      console.error("Detalhes do erro:", error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-xl mx-auto">

        <header className="flex justify-center items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold">
            {editando ? 'Editar Provento' : 'Novo Provento'}
          </h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-provento" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="mb-4">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <InputMoeda name="valor" value={formData.valor}
                  onChange={handleChange}
                />
            </div>
            <div className="mb-6">
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" id="data" name="data" value={formData.data} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div className="pt-4">
              <div className="flex justify-end gap-2">
                <Link to="/provento" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft size={20}/> Voltar
                </Link>

                <button type="submit" form="form-provento" disabled={salvando}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} /> Salvar
                </button>
              </div>
            </div>
          </form>
        </div>

        {banner && banner.type === 'success' && (
          <div className="p-4 rounded-lg mt-4 border bg-green-100 text-green-800 border-green-300">
            {banner.message}
          </div>
        )}
      </div>

      <MessageModal isOpen={modal.open} type={modal.type} message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </div>
  );
}

export default CadastroProvento;
