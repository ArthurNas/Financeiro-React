import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import tipoService from '../../service/tipoService';

const INITIAL_STATE = { id: '', descricao: '' };

function CadastroTipo() {
  const { state } = useLocation();
  const editando = !!state?.tipo;
  const [banner, setBanner] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(
    editando
      ? { id: state.tipo.id || '', descricao: state.tipo.descricao || '' }
      : { ...INITIAL_STATE }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        showBanner("success", editando ? "As alterações foram salvas." : "Tipo registrado com sucesso!");
        if (!editando) setFormData({ ...INITIAL_STATE });
      })
      .catch(error => {
        showBanner("error", "Erro ao cadastrar tipo: " + (error.response?.data?.mensagem || error.message));
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

        {banner && (
          <div className={`p-4 rounded-lg mt-4 border ${
            banner.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {banner.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default CadastroTipo;
