import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, AlertCircle, PieChart as PieChartIcon, ArrowUp, ArrowDown } from 'lucide-react';
import despesaService from '../../service/despesaService';
import proventoService from '../../service/proventoService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Home = () => {
  const [despesas, setDespesas] = useState([]);
  const [proventos, setProventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({ 
    mes: String(new Date().getMonth() + 1).padStart(2, '0'), 
    ano: String(new Date().getFullYear()) 
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      despesaService.listar({ mes: filtro.mes, ano: filtro.ano }),
      proventoService.listar({ mes: filtro.mes, ano: filtro.ano })
    ])
      .then(([resDespesas, resProventos]) => {
        setDespesas(resDespesas.data);
        setProventos(resProventos.data);
      })
      .catch(err => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  }, [filtro]);

  const totalGasto = useMemo(() => 
    despesas.reduce((acc, d) => acc + d.valor, 0), 
  [despesas]);

  const totalRenda = useMemo(() => 
    proventos.reduce((acc, p) => acc + p.valor, 0), 
  [proventos]);

  const saldoMes = useMemo(() => 
    totalRenda - totalGasto, 
  [totalRenda, totalGasto]);

  const maiorGasto = useMemo(() => 
    despesas.length > 0 ? Math.max(...despesas.map(d => d.valor)) : 0, 
  [despesas]);

  const dadosPorTipo = useMemo(() => {
    const grupos = despesas.reduce((acc, d) => {
      const nomeTipo = d.tipo?.descricao || 'Sem Tipo';
      acc[nomeTipo] = (acc[nomeTipo] || 0) + d.valor;
      return acc;
    }, {});
    return Object.keys(grupos).map((key, index) => ({ 
      name: key, 
      value: grupos[key],
      color: COLORS[index % COLORS.length]
    }));
  }, [despesas]);

  const dadosTop5 = useMemo(() => {
    const grupos = despesas.reduce((acc, d) => {
      const nomeTipo = d.descricao;
      if (!acc[nomeTipo]) {
        acc[nomeTipo] = { total: 0, count: 0 };
      }
      acc[nomeTipo].total += d.valor;
      acc[nomeTipo].count += 1;
      return acc;
    }, {});
    
    return Object.keys(grupos)
      .map(key => ({ 
        name: key, 
        valor: grupos[key].total,
        count: grupos[key].count
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
        
        <div className="flex gap-3 items-end">
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Ganho</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    R$ {totalRenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    R$ {saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    R$ {maiorGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                Gastos por Tipo
              </h2>
              
              {dadosPorTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={dadosPorTipo} 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={3} 
                      dataKey="value"
                    >
                      {dadosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  Nenhum dado para exibir
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Top 5 Maiores Gastos
              </h2>
              
              {dadosTop5.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosTop5} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} />
                    <Bar 
                      dataKey="valor" 
                      fill="#3B82F6" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                      label={{ 
                        position: 'right', 
                        fontSize: 12, 
                        fill: '#6B7280',
                        formatter: (value, entry) => {
                          return entry?.count ? `${entry.count}x` : '';
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  Nenhum dado para exibir
                </div>
              )}
            </div>
          </div>

          {dadosTop5.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Resumo das Maiores Despesas</h2>
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
                  {dadosTop5.map((d, index) => (
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
                      R$ {dadosTop5.reduce((acc, d) => acc + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
