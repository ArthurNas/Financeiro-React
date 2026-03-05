import api from '../lib/api';

const usuarioService = {
  listar: (params) => api.get('/usuario', { params }),
  salvar: (dados) => api.post('/usuario', dados),
  atualizar: (id, dados) => api.put(`/usuario/${id}`, dados),
  excluir: (id) => api.delete(`/usuario/${id}`),
  login: (dados) => api.post('/usuario/login', dados),
  buscar: (id) => api.get(`/usuario/${id}`),
};

export default usuarioService