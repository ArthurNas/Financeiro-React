import { useEffect, useState, useMemo } from 'react';
import despesaService from '../../service/despesaService';
import proventoService from '../../service/proventoService';
import { Plus, Trash2, Wallet, Search, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';
import MessageModal from '../../components/messageModal';

function Provento() {
    const [despesas, setDespesas] = useState([])
    const [proventos, setProventos] = useState([])
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });
    const [modal, setModal] = useState({ open: false, type: 'success', message: '' });

    const dataAtual = new Date()
    const [filtroMes, setFiltroMes] = useState(() => sessionStorage.getItem('provento_filtroMes') || String(dataAtual.getMonth() + 1).padStart(2, '0'))
    const [filtroAno, setFiltroAno] = useState(() => sessionStorage.getItem('provento_filtroAno') || String(dataAtual.getFullYear()))
    const [filtroDescricao, setFiltroDescricao] = useState(() => sessionStorage.getItem('provento_filtroDescricao') || '')

    const buscarDados = async () => {
      try {
        const params = { descricao: filtroDescricao, mes: filtroMes, ano: filtroAno };

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

    useEffect(() => {
        buscarDados();
    }, [filtroDescricao, filtroMes, filtroAno]);

    const handleAbrirConfirmacao = (id) => {
      setConfirmModal({ open: true, idParaExcluir: id });
    };

    const confirmarExclusao = () => {
      const id = confirmModal.idParaExcluir;
      if (!id) return;

      proventoService.excluir(id)
        .then(() => {
          buscarDados();
        })
        .catch(err => {
          setModal({
            open: true,
            type: "error",
            message: "Erro ao excluir provento: " + (error.response?.data?.mensagem || error.message),
          });
          console.error("Erro ao deletar:", err);
        });
    };

  const totalGasto = useMemo(() => 
        despesas.reduce((acc, curr) => acc + curr.valor, 0), 
    [despesas]);
  
    const totalGanho = useMemo(() => 
        proventos.reduce((acc, curr) => acc + curr.valor, 0), 
    [proventos]);
  const saldo = (totalGanho - totalGasto);

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  Meus Proventos
                </h1>
                <p className="text-sm text-gray-500">Resumo financeiro do período</p>
              </div>
            </div>

            <Link to="/cadastroProvento" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-100 hover:scale-105 active:scale-95">
              <Plus size={20} strokeWidth={3} /> Novo Provento
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Total Ganho</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                R$ {totalGanho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Total Gasto</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className={`p-4 rounded-xl border transition-all hover:shadow-md group ${saldo >= 0 ? 'bg-blue-50/30 border-blue-100 hover:bg-white' : 'bg-orange-50/30 border-orange-100 hover:bg-white'}`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-500">Saldo Atual</p>
              <p className={`text-xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </header>

        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar Descrição</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input type="text" placeholder="Ex: Salário, Freela..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={filtroDescricao} onChange={(e) => { setFiltroDescricao(e.target.value); sessionStorage.setItem('provento_filtroDescricao', e.target.value); }}/>
            </div>
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Mês</label>
            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={filtroMes}
              onChange={(e) => { setFiltroMes(e.target.value); sessionStorage.setItem('provento_filtroMes', e.target.value); }}
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
              onChange={(e) => { setFiltroAno(e.target.value); sessionStorage.setItem('provento_filtroAno', e.target.value); }}
            />
          </div>

          <button 
            onClick={() => { setFiltroDescricao(''); setFiltroMes(''); setFiltroAno(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            Limpar
          </button>
        </div>

        {/* Tabela Estilizada */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">Descrição</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Valor</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Data</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {proventos.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">{d.descricao}</td>
                  <td className="p-4 text-sm font-medium text-green-600">
                    R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-center flex justify-end gap-2">
                    <button onClick={() => navigate('/cadastroProvento', { state: { provento: d } })}
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
          {proventos.length === 0 && (
            <div className="p-8 text-center text-gray-400">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.open}
        title="Excluir Provento"
        message="Você tem certeza?"
        onClose={() => setConfirmModal({ open: false, idParaExcluir: null })}
        onConfirm={confirmarExclusao}
      />

      <MessageModal isOpen={modal.open} type={modal.type}message={modal.message}
        onClose={() => {
          setModal({ ...modal, open: false });
        }}
      />
    </div>
  )
}

export default Provento