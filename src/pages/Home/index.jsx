import { useEffect, useState } from 'react';
import despesaService from '../../service/despesaService';
import { Plus, Trash2, Wallet, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';

function Home() {
    const [despesas, setDespesas] = useState([])
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({ open: false, idParaExcluir: null });

    const dataAtual = new Date()
    const [filtroMes, setFiltroMes] = useState(String(dataAtual.getMonth() + 1).padStart(2, '0'))
    const [filtroAno, setFiltroAno] = useState(String(dataAtual.getFullYear()))
    const [filtroDescricao, setFiltroDescricao] = useState('')

    const buscarDados = async () => {
      try {
          const response = await despesaService.listar({
                  descricao: filtroDescricao,
                  mes: filtroMes,
                  ano: filtroAno
              });
          setDespesas(response.data);
      } catch (error) {
          console.error("Erro ao buscar dados filtrados:", error);
      }
    };

    useEffect(() => {
        buscarDados();
    }, [filtroDescricao, filtroMes, filtroAno]);

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
          // Opcional: mostrar um Toast ou MessageModal de sucesso aqui
        })
        .catch(err => {
          // Aqui você usaria o seu MessageModal de erro
          console.error("Erro ao deletar:", err);
        });
    };

  // Cálculo do resumo financeiro
  const totalGasto = despesas.reduce((acc, curr) => acc + curr.valor, 0)

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header com Resumo Financeiro */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-blue-600" /> Minhas Despesas
            </h1>
            <p className="text-gray-500 text-sm">Total acumulado: 
              <span className="font-bold text-gray-800 ml-1">
                R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          
          <Link to="/cadastro" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus size={20} /> Nova Despesa
          </Link>
        </header>

        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Buscar Descrição</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Ex: Aluguel, Mercado..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={filtroDescricao} onChange={(e) => setFiltroDescricao(e.target.value)}/>
            </div>
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Mês</label>
            <select 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
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
              onChange={(e) => setFiltroAno(e.target.value)}
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
                <th className="p-4 font-semibold text-sm text-gray-600">Parcela</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">{d.descricao}</td>
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
                    <button onClick={() => navigate('/cadastro', { state: { despesa: d } })}
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

export default Home