import api from '../lib/api';

const aporteService = {
  listar: (params) => api.get('/aporte', { params }),
  dashboard: () => api.get('/aporte/dashboard'),
  evolucaoDetalhada: () => api.get('/aporte/evolucao-detalhada'),
  buscarPorId: (id) => api.get(`/aporte/${id}`),
  atualizar: (id, dados) => api.put(`/aporte/${id}`, dados),
  excluir: (id) => api.delete(`/aporte/${id}`)
};

export default aporteService;
