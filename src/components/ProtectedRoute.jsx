import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Se não houver token, redireciona para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se houver token, renderiza os filhos (a página protegida)
  return children;
}