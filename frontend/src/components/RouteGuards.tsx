import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { LoadingState } from './Feedback';

/** Somente jogadores autenticados acessam as rotas internas (RN01). */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState message="Verificando sua sessão..." />;
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login e cadastro redirecionam para o catálogo quando já existe sessão. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <LoadingState message="Verificando sua sessão..." />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
