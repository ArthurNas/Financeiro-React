import { useEffect, useState, useMemo } from 'react';
import despesaService from '../../service/despesaService';
import proventoService from '../../service/proventoService';
import tipoService from '../../service/tipoService';
import projecaoService from '../../service/projecaoService';
import { Plus, Trash2, Wallet, Search, Edit2, Bell, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';
import { useValoresVisiveis } from '../../hooks/useValoresVisiveis';

function Despesa() {
    const [despesas, setDespesas] = useState([])
    const [proventos, setProventos] = useState([])
    const [tipos, setTipos] = useState([])
    const projecoes = []
    const projecaoEdits = {}
    const [valoresVisiveis, setValoresVisiveis] = useValoresVisiveis();
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });

    const dataAtual = new Date()
    const [filtroMes, setFiltroMes] = useState(() => sessionStorage.getItem('despesa_filtroMes') || String(dataAtual.getMonth() + 1).padStart(2, '0'))
    const [filtroAno, setFiltroAno] = useState(() => sessionStorage.getItem('despesa_filtroAno') || String(dataAtual.getFullYear()))
    const [filtroDescricao, setFiltroDescricao] = useState(() => sessionStorage.getItem('despesa_filtroDescricao') || '')
    const [filtroTipoId, setFiltroTipoId] = useState(() => sessionStorage.getItem('despesa_filtroTipoId') || '')

    const handleProjecaoChange = () => {};

    useEffect(() => {
      tipoService.listar().then(res => setTipos(res.data)).catch(() => {});
    }, []);

    const buscarDados = async () => {
      try {
        const params = { descricao: filtroDescricao, mes: filtroMes, ano: filtroAno, tipoId: filtroTipoId || undefined };

        const [resDespesas, resProventos] = await Promise.all([
            despesaService.listar(params),
            proventoService.listar(params)
          ]);

          setDespesas(resDespesas.data);
          setProventos(resProventos.data);
      } catch (error) {
          console.error("Erro ao buscar dados filtrados:", error);
      }
    };

    const confirmarProjecao = (projecao) => {
      const edit = projecaoEdits[projecao.id] || {};

      projecaoService.confirmar(projecao.id, {
        descricaoReal: edit.descricaoReal,
        valorReal: Number(edit.valorReal),
        dataPagamento: new Date().toISOString().split('T')[0],
      })
        .then(() => buscarDados())
        .catch((error) => console.error("Erro ao confirmar projeção:", error));
    };

    useEffect(() => {
        buscarDados();
    }, [filtroDescricao, filtroMes, filtroAno, filtroTipoId]);

    // Esta função agora apenas abre o modal e guarda o ID
    const handleAbrirConfirmacao = (id) => {
      setConfirmModal({ open: true, idParaExcluir: id });
    };

    // Esta é a função que o botão "Sim" do modal vai chamar
    const confirmarExclusao = () => {
      const id = confirmModal.idParaExcluir;
      if (!id) return;

      despesaService.excluir(id)
        .then(() => {
          buscarDados();
        })
        .catch(err => {
          // Aqui você usaria o seu MessageModal de erro
          console.error("Erro ao deletar:", err);
        });
    };

  // Cálculo do resumo financeiro
  const totalGasto = useMemo(() => 
      despesas.reduce((acc, curr) => acc + curr.valor, 0), 
  [despesas]);

  const totalGanho = useMemo(() => 
      proventos.reduce((acc, curr) => acc + curr.valor, 0), 
  [proventos]);
  const saldo = (totalGanho - totalGasto);
  const formatarValorGrande = (valor) => {
    if (!valoresVisiveis) return 'R$ ••••••';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-1 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  Minhas Despesas
                </h1>
                <p className="text-sm text-gray-500">Resumo financeiro do período</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setValoresVisiveis((visivel) => !visivel)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition hover:bg-gray-50"
              >
                {valoresVisiveis ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <Link to="/cadastroDespesa" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100 hover:scale-105 active:scale-95">
                <Plus size={20} strokeWidth={3} /> Nova Despesa
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Total Ganho</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatarValorGrande(totalGanho)}
              </p>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Total Gasto</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {formatarValorGrande(totalGasto)}
              </p>
            </div>

            <div className={`p-4 rounded-xl border transition-all hover:shadow-md group ${saldo >= 0 ? 'bg-blue-50/30 border-blue-100 hover:bg-white' : 'bg-orange-50/30 border-orange-100 hover:bg-white'}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Saldo Atual</p>
              <p className={`text-xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatarValorGrande(saldo)}
              </p>
            </div>
          </div>
        </header>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-2 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar Descrição</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input type="text" placeholder="Ex: Aluguel, Mercado..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={filtroDescricao} onChange={(e) => { setFiltroDescricao(e.target.value); sessionStorage.setItem('despesa_filtroDescricao', e.target.value); }}/>
            </div>
          </div>

          <div className="w-48">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Tipo</label>
            <select
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={filtroTipoId}
              onChange={(e) => { setFiltroTipoId(e.target.value); sessionStorage.setItem('despesa_filtroTipoId', e.target.value); }}
            >
              <option value="">Todos</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id}>{t.descricao}</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Mês</label>
            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={filtroMes}
              onChange={(e) => { setFiltroMes(e.target.value); sessionStorage.setItem('despesa_filtroMes', e.target.value); }}
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

          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Ano</label>
            <input 
              type="number"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filtroAno}
              onChange={(e) => { setFiltroAno(e.target.value); sessionStorage.setItem('despesa_filtroAno', e.target.value); }}
            />
          </div>

          <button 
            onClick={() => { setFiltroDescricao(''); setFiltroMes(''); setFiltroAno(''); setFiltroTipoId(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            Limpar
          </button>
        </div>

        {projecoes.length > 0 && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">Despesas projetadas para pagar</h2>
                <p className="text-xs text-amber-700">
                  Confira os dados e confirme o pagamento para registrar a despesa real.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {projecoes.map((p) => (
                <div key={p.id} className="grid gap-3 rounded-lg border border-amber-100 bg-white p-3 md:grid-cols-[1fr_140px_auto] md:items-end">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Descrição</label>
                    <input
                      type="text"
                      value={projecaoEdits[p.id]?.descricaoReal || ''}
                      onChange={(e) => handleProjecaoChange(p.id, 'descricaoReal', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Parcela {p.parcelaAtual}/{p.totalParcelas} - vence em {new Date(p.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Valor</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={projecaoEdits[p.id]?.valorReal || ''}
                      onChange={(e) => handleProjecaoChange(p.id, 'valorReal', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => confirmarProjecao(p)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                  >
                    <CheckCircle2 size={18} /> Confirmar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela Estilizada */}
        <div className="space-y-3 md:hidden">
          {despesas.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-gray-800">{d.descricao}</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {d.tipo?.descricao || <span className="italic text-gray-300">Sem tipo</span>}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate('/cadastroDespesa', { state: { despesa: d } })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                    aria-label="Editar despesa"
                  >
                    <Edit2 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAbrirConfirmacao(d.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                    aria-label="Excluir despesa"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">Valor</p>
                  <p className="mt-1 font-bold text-red-600">
                    R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-gray-400">Data</p>
                  <p className="mt-1 font-medium text-gray-700">
                    {new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {d.totalParcelas > 0 && (
                  <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase text-gray-400">Parcela</p>
                    <p className="mt-1 font-medium text-gray-700">
                      {d.numeroParcela}/{d.totalParcelas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {despesas.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
              Nenhum registro encontrado.
            </div>
          )}
        </div>

        <div className="hidden bg-white rounded-xl shadow-sm overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">Descrição</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Tipo</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Valor</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Data</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Parcela</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">{d.descricao}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {d.tipo?.descricao || <span className="text-gray-300 italic">Sem tipo</span>}
                  </td>
                  <td className="p-4 text-sm font-medium text-red-600">
                    R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {(d.totalParcelas > 0 ? d.numeroParcela + "/" + d.totalParcelas : "" )}
                  </td>
                  <td className="p-4 text-center flex justify-end gap-2">
                    <button onClick={() => navigate('/cadastroDespesa', { state: { despesa: d } })}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleAbrirConfirmacao(d.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
          {despesas.length === 0 && (
            <div className="p-8 text-center text-gray-400">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.open}
        title="Excluir Despesa"
        message="Você tem certeza?"
        onClose={() => setConfirmModal({ open: false, idParaExcluir: null })}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}

export default Despesa
