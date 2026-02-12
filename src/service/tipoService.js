import api from '../lib/api';

const tipoService = {
  listar: (params) => api.get('/tipo', { params }),
  salvar: (dados) => api.post('/tipo', dados),
  atualizar: (id, dados) => api.put(`/tipo/${id}`, dados),
  excluir: (id) => api.delete(`/tipo/${id}`)
};

export default tipoService