import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import despesaService from '../../service/despesaService';
import tipoService from '../../service/tipoService';
import InputMoeda from '../../components/InputMoeda';
import MessageModal from '../../components/messageModal';

const INITIAL_STATE = {
  id: '',
  descricao: '',
  valor: '',
  data: new Date().toISOString().split('T')[0],
  tipo: null,
  parcelada: false,
  numeroParcela: 0,
  totalParcelas: 0,
  credito: false,
};

function Cadastro() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editando = !!state?.despesa;
  const [tipos, setTipos] = useState([]);
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'error', message: '' });
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(
    editando
      ? {
          id: state.despesa.id || '',
          descricao: state.despesa.descricao || '',
          valor: state.despesa.valor || '',
          data: state.despesa.data || new Date().toISOString().split('T')[0],
          tipo: state.despesa.tipo ? { id: state.despesa.tipo.id } : null,
          parcelada: state.despesa.parcelada || false,
          numeroParcela: state.despesa.numeroParcela || 0,
          totalParcelas: state.despesa.totalParcelas || 0,
          credito: state.despesa.credito || false,
        }
      : { ...INITIAL_STATE }
  );

  useEffect(() => {
    tipoService.listar()
      .then(response => setTipos(response.data))
      .catch(error => console.error("Erro ao carregar tipos:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);

    const dadosParaEnviar = {
      ...formData,
      valor: parseFloat(formData.valor),
    };

    despesaService.salvar(dadosParaEnviar)
      .then(() => {
        if (editando){
          navigate('/despesa');
        } else{
          showBanner("success", "Despesa registrada com sucesso!");
          setFormData((dadosAtuais) => ({
            ...INITIAL_STATE,
            data: dadosAtuais.data,
          }));
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
            {editando ? 'Editar Despesa' : 'Nova Despesa'}
          </h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-despesa" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <InputMoeda name="valor" value={formData.valor}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" id="data" name="data" value={formData.data} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div className="mb-4">
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo da Despesa</label>
              <select id="tipo" name="tipo" value={formData.tipo?.id || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  tipo: e.target.value ? { id: e.target.value } : null,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Selecione um tipo...</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.descricao}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="parcelada" checked={formData.parcelada} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Compra parcelada</span>
              </label>

              {formData.parcelada && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Número da Parcela</label>
                    <input type="number" min="1" name="numeroParcela" value={formData.numeroParcela} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Total de Parcelas</label>
                    <input type="number" min="2" name="totalParcelas" value={formData.totalParcelas} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="credito" checked={formData.credito} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm text-blue-800">Compra no Cartão de Crédito</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <div className="flex justify-end gap-2">
                <Link to="/despesa" className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft size={20}/> Voltar
                </Link>

                <button type="submit" form="form-despesa" disabled={salvando}
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

export default Cadastro;
