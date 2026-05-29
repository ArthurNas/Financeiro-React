import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import orcamentoService from '../../service/orcamentoService';
import tipoService from '../../service/tipoService';
import MessageModal from '../../components/messageModal';

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 5 }, (_, i) => ANO_ATUAL + i);

function CadastroOrcamento() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const editando = !!state?.orcamento;
  const orcamentoEdit = state?.orcamento;

  const [tipos, setTipos] = useState([]);
  const [banner, setBanner] = useState(null);
  const [modal, setModal] = useState({ open: false, type: 'error', message: '' });
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState(
    editando ? {
      id: orcamentoEdit.id,
      rendaEstimada: orcamentoEdit.rendaEstimada,
      usarProventos: orcamentoEdit.usarProventos ?? false,
      mesInicio: orcamentoEdit.mesInicio,
      anoInicio: orcamentoEdit.anoInicio,
      mesFim: orcamentoEdit.mesFim,
      anoFim: orcamentoEdit.anoFim,
      pilares: orcamentoEdit.pilares.map(p => ({
        nomePilar: p.nomePilar,
        percentual: p.percentual,
        tipoIds: p.tipos.map(t => t.id),
      })),
    } : {
      id: null,
      rendaEstimada: '',
      usarProventos: false,
      mesInicio: new Date().getMonth() + 1,
      anoInicio: ANO_ATUAL,
      mesFim: 12,
      anoFim: ANO_ATUAL,
      pilares: [],
    }
  );

  useEffect(() => {
    tipoService.listar()
      .then(response => setTipos(response.data))
      .catch(() => showBanner('error', 'Erro ao carregar categorias.'));
  }, []);

  const showBanner = (type, message) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePilarChange = (index, field, value) => {
    setFormData(prev => {
      const pilares = [...prev.pilares];
      pilares[index] = { ...pilares[index], [field]: value };
      return { ...prev, pilares };
    });
  };

  const handleTipoToggle = (pilarIndex, tipoId) => {
    setFormData(prev => {
      const pilares = [...prev.pilares];
      const pilar = { ...pilares[pilarIndex] };
      const tipoIds = pilar.tipoIds.includes(tipoId)
        ? pilar.tipoIds.filter(id => id !== tipoId)
        : [...pilar.tipoIds, tipoId];
      pilares[pilarIndex] = { ...pilar, tipoIds };
      return { ...prev, pilares };
    });
  };

  const adicionarPilar = () => {
    setFormData(prev => ({
      ...prev,
      pilares: [...prev.pilares, { nomePilar: '', percentual: '', tipoIds: [] }],
    }));
  };

  const removerPilar = (index) => {
    setFormData(prev => ({
      ...prev,
      pilares: prev.pilares.filter((_, i) => i !== index),
    }));
  };

  const somaPercentuais = formData.pilares.reduce(
    (acc, p) => acc + (parseFloat(p.percentual) || 0), 0
  );
  const somaValida = somaPercentuais === 100;

  const tiposSelecionadosEmOutrosPilares = (pilarIndex) => {
    const ids = new Set();
    formData.pilares.forEach((p, i) => {
      if (i !== pilarIndex) p.tipoIds.forEach(id => ids.add(id));
    });
    return ids;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (salvando || !somaValida) return;
    setSalvando(true);

    const dados = {
      rendaEstimada: parseFloat(formData.rendaEstimada),
      usarProventos: formData.usarProventos,
      mesInicio: formData.mesInicio,
      anoInicio: formData.anoInicio,
      mesFim: formData.mesFim,
      anoFim: formData.anoFim,
      pilares: formData.pilares.map(p => ({
        nomePilar: p.nomePilar,
        percentual: parseFloat(p.percentual),
        tipoIds: p.tipoIds,
      })),
    };

    const request = editando
      ? orcamentoService.atualizar(formData.id, dados)
      : orcamentoService.salvar(dados);

    request
      .then(() => {
        if (editando){
          navigate('/orcamento');
        } else{
          showBanner('success', 'Orçamento salvo com sucesso!');
          setFormData(prev => ({ ...prev, pilares: [] }));
        }
      })
      .catch(error => {
        setModal({
          open: true,
          type: "error",
          message: (error.response?.data || error.message),
        });
      })
      .finally(() => setSalvando(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-3xl mx-auto">

        <header className="flex justify-center items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold">
            {editando ? 'Editar Orçamento' : 'Cadastro de Orçamento'}
          </h1>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form id="form-orcamento" onSubmit={handleSubmit}>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Renda Estimada</label>
              <div className="flex gap-3 items-start">
                <input type="number" step="0.01" name="rendaEstimada" value={formData.rendaEstimada} onChange={handleChange} required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <label className="inline-flex items-center gap-2 cursor-pointer mt-2 shrink-0">
                  <div className="relative">
                    <input type="checkbox" name="usarProventos" checked={formData.usarProventos} onChange={handleChange}
                      className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">Usar valor dos proventos</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês Início</label>
                <select name="mesInicio" value={formData.mesInicio} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                  {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Início</label>
                <select name="anoInicio" value={formData.anoInicio} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês Fim</label>
                <select name="mesFim" value={formData.mesFim} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                  {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Fim</label>
                <select name="anoFim" value={formData.anoFim} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Pilares do Orçamento</h2>
                <button type="button" onClick={adicionarPilar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer">
                  <Plus size={18} /> Adicionar Pilar
                </button>
              </div>

              {formData.pilares.length === 0 && (
                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhum pilar cadastrado. Clique em "Adicionar Pilar" para começar.
                </div>
              )}

              {formData.pilares.map((pilar, index) => {
                const tiposDesabilitados = tiposSelecionadosEmOutrosPilares(index);
                return (
                  <div key={index} className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pilar {index + 1}</span>
                      <button type="button" onClick={() => removerPilar(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pilar</label>
                        <input type="text" value={pilar.nomePilar} onChange={e => handlePilarChange(index, 'nomePilar', e.target.value)} required
                          placeholder="Ex: Despesas Fixas"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentual (%)</label>
                        <input type="number" step="0.01" min="0" max="100" value={pilar.percentual}
                          onChange={e => handlePilarChange(index, 'percentual', e.target.value)} required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categorias (Tipos de Despesa)</label>
                      {tipos.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Nenhuma categoria disponível.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-white rounded-lg border border-gray-200">
                          {tipos.map(tipo => {
                            const desabilitado = tiposDesabilitados.has(tipo.id);
                            const selecionado = pilar.tipoIds.includes(tipo.id);
                            return (
                              <label key={tipo.id}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors
                                  ${desabilitado ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'hover:bg-blue-50'}
                                  ${selecionado && !desabilitado ? 'bg-blue-100 border border-blue-300' : ''}`}>
                                <input type="checkbox" checked={selecionado} disabled={desabilitado}
                                  onChange={() => handleTipoToggle(index, tipo.id)}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                {tipo.descricao}
                                {desabilitado && <span className="text-xs text-gray-400 ml-auto">(já usado)</span>}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Soma dos Percentuais:</span>
              <span className={`text-lg font-bold ${somaValida ? 'text-green-600' : 'text-red-500'}`}>
                {somaPercentuais.toFixed(2)}% / 100%
              </span>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-2">
                <Link to="/orcamento"
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <ArrowLeft size={20} /> Voltar
                </Link>
                <button type="submit" form="form-orcamento" disabled={salvando || !somaValida || formData.pilares.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save size={20} /> {editando ? 'Atualizar' : 'Salvar Orçamento'}
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

export default CadastroOrcamento;
