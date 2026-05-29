import api from '../lib/api';

const orcamentoService = {
  listar: () => api.get('/orcamento'),
  buscarPorId: (id) => api.get(`/orcamento/${id}`),
  salvar: (dados) => api.post('/orcamento', dados),
  atualizar: (id, dados) => api.put(`/orcamento/${id}`, dados),
  excluir: (id) => api.delete(`/orcamento/${id}`),
  dashboard: (params) => api.get('/orcamento/dashboard', { params }),
};

export default orcamentoService;
