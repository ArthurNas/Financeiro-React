import { useEffect, useState } from 'react';
import aporteService from '../../service/aporteService';
import objetivoService from '../../service/objetivoService';
import {
  Trash2, TrendingUp, PiggyBank, Building2, Home, HelpCircle,
  X, Save, Calculator, Wallet, Plus, Target
} from 'lucide-react';
import ConfirmModal from '../../components/confirmModal';

const CATEGORY_ICONS = {
  'Ações': Building2,
  'FIIs': Home,
  'Sem Categoria': HelpCircle,
  'Outros': HelpCircle,
};

function AssetIcon({ ticker }) {
  const cat = !ticker ? 'Sem Categoria' : /11$/.test(ticker) ? 'FIIs' : /[34]$/.test(ticker) ? 'Ações' : 'Outros';
  const Icon = CATEGORY_ICONS[cat] || HelpCircle;
  return <Icon size={16} className="inline-block" />;
}

function EditModal({ aporte, onClose, onSave }) {
  const [ticker, setTicker] = useState(aporte.ticker || '');
  const [quantidade, setQuantidade] = useState(aporte.quantidade != null ? String(aporte.quantidade) : '');
  const [precoUnitario, setPrecoUnitario] = useState(aporte.precoUnitario != null ? String(aporte.precoUnitario) : '');
  const [objetivoId, setObjetivoId] = useState(aporte.objetivoId || '');
  const [objetivos, setObjetivos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    objetivoService.listarAtivos().then(r => setObjetivos(r.data || [])).catch(() => {});
  }, []);

  const qtdNum = parseFloat(quantidade) || 0;
  const precoNum = parseFloat(precoUnitario) || 0;
  const calculado = qtdNum * precoNum;
  const diferenca = calculado - (aporte.valor || 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        descricao: aporte.descricao,
        valor: aporte.valor,
        data: aporte.data,
        ticker: ticker || null,
        quantidade: quantidade ? parseFloat(quantidade) : null,
        precoUnitario: precoUnitario ? parseFloat(precoUnitario) : null,
        custosOperacionais: null,
        objetivoId: objetivoId || null,
      };
      await aporteService.atualizar(aporte.id, payload);
      onSave();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* CORREÇÃO: max-h e flex-col para controlar o layout interno */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col relative animate-in zoom-in duration-200">
        
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10">
          <X size={20} />
        </button>

        {/* CORREÇÃO: Container com scroll apenas no conteúdo do form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Editar Aporte</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descrição</label>
            <p className="text-sm font-medium text-gray-800">{aporte.descricao}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valor Original</label>
            <p className="text-sm font-semibold text-green-600">
              R$ {Number(aporte.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
              <Calculator size={14} /> Detalhes do Ativo
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticker</label>
                <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
                  placeholder="Ex: ITSA4, MXRF11"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input type="number" step="any" value={quantidade} onChange={e => setQuantidade(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unit.</label>
                  <input type="number" step="any" value={precoUnitario} onChange={e => setPrecoUnitario(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              {(qtdNum > 0 && precoNum > 0) && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Qtd × Preço =</span>
                    <span className="font-bold text-gray-800">
                      R$ {calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {Math.abs(diferenca) > 0.01 && (
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-500">Diferença do valor original:</span>
                      <span className={diferenca > 0 ? 'text-blue-600 font-semibold' : 'text-orange-600 font-semibold'}>
                        {diferenca > 0 ? '+' : ''}R$ {diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
              <Target size={14} /> Objetivo
            </h3>
            <select value={objetivoId} onChange={e => setObjetivoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
              <option value="">Sem objetivo</option>
              {objetivos.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.nome}</option>
              ))}
            </select>
          </div>
        </div> {/* CORREÇÃO: Tag duplicada removida d daqui */}

        {/* CORREÇÃO: Rodapé fixo para os botões com borda sutil */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  );
}

function ConsumirModal({ objetivo, onClose, onConsumir }) {
  const [valor, setValor] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [marcarConcluido, setMarcarConcluido] = useState(false);
  const [saving, setSaving] = useState(false);

  const valorNum = parseFloat(valor.replace(',', '.')) || 0;
  const saldo = Number(objetivo.saldoAtual);

  const handleConfirm = async () => {
    if (valorNum <= 0 || valorNum > saldo) return;
    setSaving(true);
    try {
      await onConsumir({
        objetivoId: objetivo.id,
        valorConsumido: valorNum,
        justificativa,
        marcarConcluido: marcarConcluido || undefined,
      });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in duration-200">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-1">Usar Dinheiro</h2>
        <p className="text-sm text-gray-500 mb-5">{objetivo.nome}</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Saldo Disponível</label>
            <p className="text-lg font-bold text-green-600">
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor a Usar</label>
            <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
              min="0.01" max={saldo}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            {valorNum > saldo && (
              <p className="text-xs text-red-500 mt-1">Valor excede o saldo disponível</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
            <input type="text" value={justificativa} onChange={e => setJustificativa(e.target.value)}
              placeholder="Ex: Comprei um celular novo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={marcarConcluido} onChange={e => setMarcarConcluido(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600">Marcar objetivo como concluído</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={saving || valorNum <= 0 || valorNum > saldo}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Wallet size={18} /> {saving ? 'Consumindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CriarObjetivoModal({ onClose, onCriar }) {
  const [nome, setNome] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!nome.trim() || !valorAlvo) return;
    setSaving(true);
    try {
      await onCriar({ nome: nome.trim(), valorAlvo: parseFloat(valorAlvo.replace(',', '.')) });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in duration-200">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-5">Novo Objetivo</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Ex: Celular Novo, Reserva de Emergência"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Alvo</label>
            <input type="number" step="0.01" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={saving || !nome.trim() || !valorAlvo}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Target size={18} /> {saving ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Aportes() {
  const [dashboard, setDashboard] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });
  const [editAporte, setEditAporte] = useState(null);
  const [consumirModal, setConsumirModal] = useState({ open: false, objetivo: null });
  const [criarObjetivoModal, setCriarObjetivoModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const carregarDados = async (pagina = 0) => {
    try {
      setLoading(true);
      const [resLista, resDash, resObjetivos] = await Promise.all([
        aporteService.listar({ page: pagina, size: pageSize }),
        aporteService.dashboard(),
        objetivoService.listarAtivos(),
      ]);
      setAportes(resLista.data.content);
      setTotalPages(resLista.data.totalPages);
      setPage(resLista.data.number);
      setDashboard(resDash.data);
      setObjetivos(resObjetivos.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(0); }, [pageSize]);

  const handleAbrirConfirmacao = (id) => {
    setConfirmModal({ open: true, idParaExcluir: id });
  };

  const confirmarExclusao = () => {
    const id = confirmModal.idParaExcluir;
    if (!id) return;
    aporteService.excluir(id)
      .then(() => carregarDados(page))
      .catch(err => console.error("Erro ao deletar:", err));
  };

  const handleConsumir = async (payload) => {
    await objetivoService.consumir(payload);
    carregarDados(page);
  };

  const handleCriarObjetivo = async (payload) => {
    await objetivoService.criar(payload);
    carregarDados(page);
  };

  const formatarData = (dataStr) =>
    new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');

  const categoryBadge = (ticker) => {
    if (!ticker) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          <HelpCircle size={12} /> Sem ticker
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 font-mono">
        <AssetIcon ticker={ticker} />
        {ticker}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Aportes</h1>
                <p className="text-sm text-gray-500">Investimentos e contribuições mensais</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registros por página</label>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Histórico de Aportes</h2>
                {totalPages > 0 && (
                  <span className="text-xs text-gray-400">{page * 10 + 1}-{Math.min((page + 1) * 10, page * 10 + aportes.length)} de {totalPages * 10}</span>
                )}
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : aportes.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">Nenhum aporte encontrado</div>
              ) : (
                <>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-3 font-semibold text-sm text-gray-600">Data</th>
                        <th className="p-3 font-semibold text-sm text-gray-600">Descrição</th>
                        <th className="p-3 font-semibold text-sm text-gray-600">Ativo</th>
                        <th className="p-3 font-semibold text-sm text-gray-600">Objetivo</th>
                        <th className="p-3 font-semibold text-sm text-gray-600 text-right">Valor</th>
                        <th className="p-3 font-semibold text-sm text-gray-600 text-right w-20">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aportes.map(a => (
                        <tr key={a.id}
                          onClick={() => setEditAporte(a)}
                          className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer">
                          <td className="p-3 text-sm text-gray-500">{formatarData(a.data)}</td>
                          <td className="p-3 text-sm font-medium text-gray-800">{a.descricao}</td>
                          <td className="p-3">{categoryBadge(a.ticker)}</td>
                          <td className="p-3">
                            {a.objetivoNome ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                <Target size={12} /> {a.objetivoNome}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className={`p-3 text-sm font-semibold text-right ${Number(a.valor) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {Number(a.valor) < 0 ? '-' : ''}R$ {Math.abs(Number(a.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={e => { e.stopPropagation(); handleAbrirConfirmacao(a.id); }}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100">
                      <button disabled={page === 0} onClick={() => carregarDados(page - 1)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        Anterior
                      </button>
                      <span className="text-sm text-gray-500">Página {page + 1} de {totalPages}</span>
                      <button disabled={page >= totalPages - 1} onClick={() => carregarDados(page + 1)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            {dashboard && (
              <>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Total no Mês</p>
                      <p className="text-xl font-bold text-green-600 mt-1">
                        R$ {Number(dashboard.totalMesAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="text-green-500" size={22} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Total Histórico</p>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        R$ {Number(dashboard.totalHistorico).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <PiggyBank className="text-blue-500" size={22} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Meus Objetivos</h2>
                <button onClick={() => setCriarObjetivoModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors cursor-pointer">
                  <Plus size={14} /> Criar Novo
                </button>
              </div>
              {objetivos.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                  {objetivos.map(obj => {
                    const saldo = Number(obj.saldoAtual);
                    const alvo = Number(obj.valorAlvo);
                    const percentual = alvo > 0 ? Math.min((saldo / alvo) * 100, 100) : 0;
                    return (
                      <div key={obj.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-800 truncate mr-2">{obj.nome}</span>
                          <button onClick={() => setConsumirModal({ open: true, objetivo: obj })}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 shrink-0 cursor-pointer"
                            title="Usar dinheiro deste objetivo">
                            <Wallet size={16} />
                          </button>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span>de R$ {alvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="font-medium text-gray-700">{percentual.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 text-sm gap-2">
                  <Target size={28} className="text-gray-300" />
                  <span>Nenhum objetivo ativo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editAporte && (
        <EditModal
          aporte={editAporte}
          onClose={() => setEditAporte(null)}
          onSave={() => { setEditAporte(null); carregarDados(page); }}
        />
      )}

      {consumirModal.open && (
        <ConsumirModal
          objetivo={consumirModal.objetivo}
          onClose={() => setConsumirModal({ open: false, objetivo: null })}
          onConsumir={handleConsumir}
        />
      )}

      {criarObjetivoModal && (
        <CriarObjetivoModal
          onClose={() => setCriarObjetivoModal(false)}
          onCriar={handleCriarObjetivo}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        title="Excluir Aporte"
        message="Você tem certeza que deseja excluir este aporte?"
        onClose={() => setConfirmModal({ open: false, idParaExcluir: null })}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}

export default Aportes;
