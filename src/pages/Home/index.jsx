import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import despesaService from '../../service/despesaService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Home = () => {
  const [despesas, setDespesas] = useState([]);
  const [filtro, setFiltro] = useState({ 
    mes: String(new Date().getMonth() + 1).padStart(2, '0'), 
    ano: String(new Date().getFullYear()) 
  });

  useEffect(() => {
    // Busca as despesas do mês selecionado
    despesaService.listar({ mes: filtro.mes, ano: filtro.ano })
      .then(res => setDespesas(res.data));
  }, [filtro]);

  /*const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timeout);
  }, []);*/

  // ENGENHARIA DE DADOS: Agrupar por Tipo para o Gráfico de Rosca
  const dadosPorTipo = useMemo(() => {
    const grupos = despesas.reduce((acc, d) => {
      const nomeTipo = d.tipo?.descricao || 'Sem Tipo';
      acc[nomeTipo] = (acc[nomeTipo] || 0) + d.valor;
      return acc;
    }, {});
    return Object.keys(grupos).map(key => ({ name: key, value: grupos[key] }));
  }, [despesas]);

  // ENGENHARIA DE DADOS: Top 5 gastos por Descrição
  const dadosPorDescricao = useMemo(() => {
    return [...despesas]
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
      .map(d => ({ name: d.descricao, valor: d.valor }));
  }, [despesas]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Dashboards</h1>
        
        {/* Filtros: Use os mesmos Selects que você já criou na tela de listagem */}
        <div className="flex gap-2">
          <div className="w-40">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Mês</label>
            <select value={filtro.mes} onChange={e => setFiltro({...filtro, mes: e.target.value})}
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
          
          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Ano</label>
            <input type="number" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filtro.ano} onChange={e => setFiltro({...filtro, ano: e.target.value})}/>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card do Gráfico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px] w-full overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
            Gastos por Categoria
          </h2>
          
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosPorTipo} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {dadosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico por Descrição
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Top 5 Maiores Gastos</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosPorDescricao} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} fontSize={12} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="valor" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>
    </div>
  );
};

export default Home;