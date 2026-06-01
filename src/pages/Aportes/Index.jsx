import { useEffect, useState, useMemo } from 'react';
import aporteService from '../../service/aporteService';
import {
  Trash2, TrendingUp, PiggyBank, Building2, Home, HelpCircle,
  X, Save, Calculator
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import ConfirmModal from '../../components/confirmModal';

const TICKER_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#D946EF', '#0EA5E9', '#10B981', '#EAB308',
];

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
  const [saving, setSaving] = useState(false);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in duration-200">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-800 mb-5">Editar Aporte</h2>

        <div className="space-y-4 mb-6">
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
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
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

function Aportes() {
  const [dashboard, setDashboard] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });
  const [editAporte, setEditAporte] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const carregarDados = async (pagina = 0) => {
    try {
      setLoading(true);
      const [resLista, resDash, resEvol] = await Promise.all([
        aporteService.listar({ page: pagina, size: pageSize }),
        aporteService.dashboard(),
        aporteService.evolucaoDetalhada(),
      ]);
      setAportes(resLista.data.content);
      setTotalPages(resLista.data.totalPages);
      setPage(resLista.data.number);
      setDashboard(resDash.data);
      setEvolucao(resEvol.data || []);
    } catch (err) {
      console.error("Erro ao carregar aportes:", err);
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

  const tickers = useMemo(() => {
    const set = new Set();
    evolucao.forEach(item => {
      Object.keys(item).forEach(k => {
        if (k !== 'mes') set.add(k);
      });
    });
    return Array.from(set);
  }, [evolucao]);

  const tickerColorMap = useMemo(() => {
    const map = {};
    tickers.forEach((t, i) => { map[t] = TICKER_COLORS[i % TICKER_COLORS.length]; });
    return map;
  }, [tickers]);

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
                          <td className="p-3 text-sm font-semibold text-green-600 text-right">
                            R$ {Number(a.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Por Ativo</h2>
              {evolucao.length > 0 && tickers.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={evolucao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" fontSize={10} tickLine={false} interval="preserveStartEnd" />
                    <YAxis fontSize={10} tickLine={false}
                      tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v} />
                    <Tooltip
                      formatter={(value, name) => ['R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), name]}
                    />
                    {tickers.map(t => (
                      <Area key={t} type="monotone" dataKey={t} stackId="1"
                        stroke={tickerColorMap[t]} fill={tickerColorMap[t]} strokeWidth={1} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
                  Sem dados para exibir
                </div>
              )}

              {tickers.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-gray-100 max-h-24 overflow-y-auto">
                  {tickers.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: tickerColorMap[t] }} />
                      {t}
                    </span>
                  ))}
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
