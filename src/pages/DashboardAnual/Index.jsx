import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../lib/api';

const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const DashboardAnual = () => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/resumo/anual', { params: { ano } })
      .then(res => setDados(res.data))
      .catch(err => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  }, [ano]);

  const totais = useMemo(() => {
    return dados.reduce((acc, mes) => ({
      renda: acc.renda + (mes.totalRenda || 0),
      gastos: acc.gastos + (mes.totalGastos || 0),
      lucro: acc.lucro + (mes.lucro || 0)
    }), { renda: 0, gastos: 0, lucro: 0 });
  }, [dados]);

  const dadosGrafico = useMemo(() => {
    return dados.map(d => ({
      mes: meses[d.mes] || '',
      renda: d.totalRenda || 0,
      gastos: d.totalGastos || 0,
      lucro: d.lucro || 0
    }));
  }, [dados]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((p, index) => (
            <p key={index} style={{ color: p.color }} className="text-sm">
              {p.name}: R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ))}
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
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Anual</h1>
            <p className="text-sm text-gray-500">Resumo financeiro do ano</p>
          </div>
        </div>
        
        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Ano</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={ano} 
            onChange={e => setAno(parseInt(e.target.value) || new Date().getFullYear())}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Renda Anual</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    R$ {totais.renda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <p className="text-xs font-semibold text-gray-500 uppercase">Gastos Anuais</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    R$ {totais.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <ArrowDown className="text-red-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-xl shadow-sm border ${totais.lucro >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Lucro Total</p>
                  <p className={`text-2xl font-bold mt-1 ${totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {totais.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${totais.lucro >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totais.lucro >= 0 ? (
                    <ArrowUp className={totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                  ) : (
                    <ArrowDown className={totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase">Resumo Mensal</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50">Mês</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Renda</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Gastos</th>
                    <th className="p-4 font-semibold text-sm text-gray-600 bg-gray-50 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((d) => (
                    <tr key={d.mes} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-800">{meses[d.mes]}</td>
                      <td className="p-4 text-sm text-green-600 text-right font-medium">
                        R$ {(d.totalRenda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-sm text-red-600 text-right font-medium">
                        R$ {(d.totalGastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 text-sm text-right font-bold ${(d.lucro || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {(d.lucro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-200">
                  <tr>
                    <td className="p-4 font-bold text-gray-800">TOTAL</td>
                    <td className="p-4 font-bold text-green-600 text-right">
                      R$ {totais.renda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-bold text-red-600 text-right">
                      R$ {totais.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-4 font-bold text-right ${totais.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {totais.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Gráfico Anual
            </h2>
            
            {dadosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={value => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="renda" name="Renda" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                Nenhum dado para exibir
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnual;
