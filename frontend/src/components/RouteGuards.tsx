import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { safeRedirectPath } from '../utils/redirect';
import { LoadingState } from './Feedback';

/** Somente jogadores autenticados acessam as rotas internas (RN01). */
export function ProtectedRoute() {
  const { status, loggedOut } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState message="Verificando sua sessão..." />;
  if (status === 'anonymous') {
    // Depois do botão Sair, o próximo login começa pelo catálogo (sem voltar à página anterior).
    const state = loggedOut ? null : { from: location.pathname };
    return <Navigate to="/login" replace state={state} />;
  }
  return <Outlet />;
}

/**
 * Login e cadastro redirecionam quando já existe sessão: para a página protegida que o jogador
 * tentou abrir (somente caminhos internos) ou para o catálogo. O mesmo destino é usado pela tela
 * de login, para que os dois redirecionamentos não disputem entre si.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <LoadingState message="Verificando sua sessão..." />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: unknown } | null)?.from;
    return <Navigate to={safeRedirectPath(from)} replace />;
  }
  return <Outlet />;
}
