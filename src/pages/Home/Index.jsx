import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown, Bell, CheckCircle2, ChevronDown, ChevronUp, Trash2, Eye, EyeOff } from 'lucide-react';
import despesaService from '../../service/despesaService';
import proventoService from '../../service/proventoService';
import projecaoService from '../../service/projecaoService';
import tipoService from '../../service/tipoService';
import ResumoOrcamentoWidget from '../../components/ResumoOrcamentoWidget';
import InputMoeda from '../../components/InputMoeda';
import { useValoresVisiveis } from '../../hooks/useValoresVisiveis';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
const hoje = new Date().toISOString().split('T')[0];

const Home = () => {
  const [despesas, setDespesas] = useState([]);
  const [proventos, setProventos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [projecoes, setProjecoes] = useState([]);
  const [projecaoEdits, setProjecaoEdits] = useState({});
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [valoresVisiveis, setValoresVisiveis] = useValoresVisiveis();
  const [modalRecorrenteAberto, setModalRecorrenteAberto] = useState(false);
  const [salvandoRecorrente, setSalvandoRecorrente] = useState(false);
  const [recorrenteForm, setRecorrenteForm] = useState({
    descricao: '',
    valorEstimado: '',
    dataVencimento: new Date().toISOString().split('T')[0],
    tipoId: '',
  });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({ 
    mes: String(new Date().getMonth() + 1).padStart(2, '0'), 
    ano: String(new Date().getFullYear()) 
  });

  const carregarDados = () => {
    setLoading(true);
    Promise.all([
      despesaService.listar({ mes: filtro.mes, ano: filtro.ano }),
      proventoService.listar({ mes: filtro.mes, ano: filtro.ano }),
      projecaoService.listarPendentes({ mes: filtro.mes || undefined, ano: filtro.ano || undefined })
    ])
      .then(([resDespesas, resProventos, resProjecoes]) => {
        setDespesas(resDespesas.data);
        setProventos(resProventos.data);
        setProjecoes(resProjecoes.data);
        setProjecaoEdits(Object.fromEntries(resProjecoes.data.map((p) => [
          p.id,
          {
            descricaoReal: p.descricao || '',
            valorReal: p.valorEstimado ?? '',
            dataPagamento: hoje,
          }
        ])));
      })
      .catch(err => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarDados();
  }, [filtro]);

  useEffect(() => {
    tipoService.listar()
      .then((res) => setTipos(res.data))
      .catch((err) => console.error("Erro ao carregar tipos:", err));
  }, []);

  const handleProjecaoChange = (id, campo, valor) => {
    setProjecaoEdits((edits) => ({
      ...edits,
      [id]: {
        ...edits[id],
        [campo]: valor,
      },
    }));
  };

  const confirmarProjecao = (projecao) => {
    const edit = projecaoEdits[projecao.id] || {};

    projecaoService.confirmar(projecao.id, {
      descricaoReal: edit.descricaoReal,
      valorReal: Number(edit.valorReal),
      dataPagamento: edit.dataPagamento || hoje,
    })
      .then(() => carregarDados())
      .catch((error) => console.error("Erro ao confirmar projeção:", error));
  };

  const excluirProjecao = (projecao) => {
    const mensagem = projecao.tipoRecorrencia === 'RECORRENTE_VARIAVEL'
      ? 'Deseja excluir esta recorrência?'
      : 'Deseja excluir este alerta?';

    if (!window.confirm(mensagem)) return;

    projecaoService.excluir(projecao.id)
      .then(() => carregarDados())
      .catch((error) => console.error("Erro ao excluir projeção:", error));
  };

  const excluirProjecaoApenasMes = (projecao) => {
    if (!window.confirm('Deseja excluir este alerta apenas neste mes?')) return;

    projecaoService.excluirMes(projecao.id)
      .then(() => carregarDados())
      .catch((error) => console.error("Erro ao excluir alerta do mes:", error));
  };

  const handleRecorrenteChange = (e) => {
    const { name, value } = e.target;
    setRecorrenteForm((form) => ({ ...form, [name]: value }));
  };

  const criarRecorrente = (e) => {
    e.preventDefault();
    if (salvandoRecorrente) return;

    setSalvandoRecorrente(true);
    projecaoService.criarRecorrente({
      descricao: recorrenteForm.descricao,
      valorEstimado: Number(recorrenteForm.valorEstimado),
      dataVencimento: recorrenteForm.dataVencimento,
      tipoId: recorrenteForm.tipoId || null,
    })
      .then(() => {
        setModalRecorrenteAberto(false);
        setAlertasAbertos(true);
        setRecorrenteForm({
          descricao: '',
          valorEstimado: '',
          dataVencimento: new Date().toISOString().split('T')[0],
          tipoId: '',
        });
        carregarDados();
      })
      .catch((error) => console.error("Erro ao criar despesa recorrente:", error))
      .finally(() => setSalvandoRecorrente(false));
  };

  const totalGasto = useMemo(() => 
    despesas.reduce((acc, d) => acc + d.valor, 0), 
  [despesas]);

  const totalRenda = useMemo(() => 
    proventos.reduce((acc, p) => acc + p.valor, 0), 
  [proventos]);

  const saldoMes = useMemo(() => 
    totalRenda - totalGasto, 
  [totalRenda, totalGasto]);

  const totalProjetado = useMemo(() =>
    projecoes.reduce((acc, p) => acc + Number(p.valorEstimado || 0), 0),
  [projecoes]);

  const formatarValorGrande = (valor) => {
    if (!valoresVisiveis) return 'R$ ••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const maiorGasto = useMemo(() => 
    despesas.length > 0 ? Math.max(...despesas.map(d => d.valor)) : 0, 
  [despesas]);

  const dadosPorTipo = useMemo(() => {
    const grupos = despesas.reduce((acc, d) => {
      const nomeTipo = d.tipo?.descricao || 'Sem Tipo';
      acc[nomeTipo] = (acc[nomeTipo] || 0) + d.valor;
      return acc;
    }, {});
    return Object.keys(grupos)
      .map(key => ({ name: key, valor: grupos[key] }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [despesas]);

  const dadosTop10 = useMemo(() => {
    const grupos = despesas.reduce((acc, d) => {
      const nome = d.descricao;
      if (!acc[nome]) {
        acc[nome] = { total: 0, count: 0 };
      }
      acc[nome].total += d.valor;
      acc[nome].count += 1;
      return acc;
    }, {});
    
    return Object.keys(grupos)
      .map(key => ({ 
        name: key, 
        valor: grupos[key].total,
        count: grupos[key].count
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [despesas]);

  const nomeMes = useMemo(() => {
    const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[parseInt(filtro.mes)] || '';
  }, [filtro.mes]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-blue-600 font-bold">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {payload[0].payload.count && (
            <p className="text-xs text-gray-500">{payload[0].payload.count} despesa(s)</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Mensal</h1>
            <p className="text-sm text-gray-500">
              {nomeMes} de {filtro.ano} • {despesas.length} despesas registradas
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-end">
          <button
            type="button"
            onClick={() => setValoresVisiveis((visivel) => !visivel)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition hover:bg-gray-50"
          >
            {valoresVisiveis ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setModalRecorrenteAberto(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Nova recorrente
          </button>

          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Mês</label>
            <select 
              value={filtro.mes} 
              onChange={e => setFiltro({...filtro, mes: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>
          
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Ano</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filtro.ano} 
              onChange={e => setFiltro({...filtro, ano: e.target.value})}
            />
          </div>
        </div>
      </header>

      {projecoes.length > 0 && (
        <section className="mb-3 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
          <button
            type="button"
            onClick={() => setAlertasAbertos((aberto) => !aberto)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">Despesas projetadas para pagar</h2>
                <p className="text-xs text-amber-700">
                  {projecoes.length} pendente(s) no período • Total estimado R$ {totalProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-amber-800">
              {alertasAbertos ? 'Recolher' : 'Ver alertas'}
              {alertasAbertos ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {alertasAbertos && (
            <div className="grid gap-3 border-t border-amber-200 p-4 pt-3 lg:grid-cols-2">
              {projecoes.map((p) => (
                <div key={p.id} className="grid gap-3 rounded-lg border border-amber-100 bg-white p-3 sm:grid-cols-[1fr_120px_150px]">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Descrição</label>
                    <input
                      type="text"
                      value={projecaoEdits[p.id]?.descricaoReal || ''}
                      onChange={(e) => handleProjecaoChange(p.id, 'descricaoReal', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {Number(p.totalParcelas) > 0 ? `Parcela ${p.parcelaAtual}/${p.totalParcelas} - ` : ''}
                      vence em {new Date(p.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Valor</label>
                    <InputMoeda
                      name="valorReal"
                      value={projecaoEdits[p.id]?.valorReal || ''}
                      onChange={(e) => handleProjecaoChange(p.id, 'valorReal', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Pago em</label>
                    <input
                      type="date"
                      value={projecaoEdits[p.id]?.dataPagamento || hoje}
                      onChange={(e) => handleProjecaoChange(p.id, 'dataPagamento', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid gap-2 sm:col-span-3 sm:grid-cols-[1fr_auto_auto]">
                    <button
                      type="button"
                      onClick={() => confirmarProjecao(p)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      <CheckCircle2 size={18} /> Confirmar
                    </button>
                    <button
                        type="button"
                        onClick={() => excluirProjecaoApenasMes(p)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50"
                      >
                        <Trash2 size={18} /> Excluir mês
                      </button>
                    <button
                      type="button"
                      onClick={() => excluirProjecao(p)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={18} /> {p.tipoRecorrencia === 'RECORRENTE_VARIAVEL' ? 'Excluir recorrência' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Ganho</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatarValorGrande(totalRenda)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="text-green-500" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Gasto</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatarValorGrande(totalGasto)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <DollarSign className="text-red-500" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Saldo do Mês</p>
                  <p className={`text-2xl font-bold mt-1 ${saldoMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatarValorGrande(saldoMes)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${saldoMes >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {saldoMes >= 0 ? (
                    <ArrowUp className="text-green-500" size={24} />
                  ) : (
                    <ArrowDown className="text-red-500" size={24} />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Maior Gasto</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {formatarValorGrande(maiorGasto)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ArrowUp className="text-orange-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Top 10 Gastos por Tipo
              </h2>
              
              {dadosPorTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosPorTipo} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={130} 
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} />
                    <Bar 
                      dataKey="valor" 
                      fill="#3B82F6" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  Nenhum dado para exibir
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <ResumoOrcamentoWidget mes={filtro.mes} ano={filtro.ano} />
            </div>
          </div>

          {dadosTop10.length > 0 && (
            <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Top 10 Despesas</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600">#</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Categoria</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Qtd</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosTop10.map((d, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-400 text-sm">{index + 1}</td>
                      <td className="p-4 text-sm font-medium text-gray-800">{d.name}</td>
                      <td className="p-4 text-sm text-gray-500">{d.count}</td>
                      <td className="p-4 text-sm font-semibold text-red-600">
                        R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="p-4 font-semibold text-gray-700 text-right">Total:</td>
                    <td className="p-4 font-bold text-red-600">
                      R$ {dadosTop10.reduce((acc, d) => acc + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {modalRecorrenteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800">Nova despesa recorrente</h2>
              <p className="text-sm text-gray-500">
                Crie um alerta mensal para contas de valor variável, como água ou luz.
              </p>
            </div>

            <form onSubmit={criarRecorrente} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  value={recorrenteForm.descricao}
                  onChange={handleRecorrenteChange}
                  required
                  placeholder="Ex: Conta de luz"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Valor estimado</label>
                  <InputMoeda
                    name="valorEstimado"
                    value={recorrenteForm.valorEstimado}
                    onChange={handleRecorrenteChange}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Primeiro vencimento</label>
                  <input
                    type="date"
                    name="dataVencimento"
                    value={recorrenteForm.dataVencimento}
                    onChange={handleRecorrenteChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo da despesa</label>
                <select
                  name="tipoId"
                  value={recorrenteForm.tipoId}
                  onChange={handleRecorrenteChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Sem tipo</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.descricao}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalRecorrenteAberto(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoRecorrente}
                  className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {salvandoRecorrente ? 'Salvando...' : 'Salvar recorrente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
