import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import tipoService from '../../service/tipoService';
import MessageModal from '../../components/messageModal';

const INITIAL_STATE = { id: '', descricao: '', isAporte: false };

function CadastroTipo() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editando = !!state?.tipo;
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'error', message: '' });
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(
    editando
      ? { id: state.tipo.id || '', descricao: state.tipo.descricao || '', isAporte: state.tipo.isAporte ?? false }
      : { ...INITIAL_STATE }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);

    tipoService.salvar(formData)
      .then(() => {
        if (editando){
          navigate('/tipo');
        } else{
          showBanner("success", "Tipo registrado com sucesso!");
          setFormData({ ...INITIAL_STATE });
        }
      })
      .catch(error => {
        setModal({
          open: true,
          type: "error",
          message: (error.response?.data || error.message),
        });
        console.error("Detalhes do erro:", error);
      })
      .finally(() => setSalvando(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-xl mx-auto">

        <header className="flex justify-center items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold">
            {editando ? 'Editar Tipo' : 'Novo Tipo'}
          </h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-tipo" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div className="mb-6">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="isAporte" checked={formData.isAporte} onChange={handleChange}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                </div>
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-green-600" />
                  Esta categoria representa um investimento/aporte?
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Link to="/tipo" className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded-lg">
                <ArrowLeft size={20}/> Voltar
              </Link>

              <button type="submit" form="form-tipo" disabled={salvando}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} /> Salvar
              </button>
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

export default CadastroTipo;
