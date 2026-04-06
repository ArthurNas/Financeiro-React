import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const { exp } = jwtDecode(token);
    console.log(exp * 1000 < Date.now());
    console.log(exp * 1000);
    console.log(exp);
    console.log(Date.now());
    if (exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/*
 nessa tela de home crie dashboards dos gastos coloque um filtro de mes
*/