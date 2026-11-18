import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Cada nova tela começa do topo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: { loggedOut: true } });
  };

  return (
    <div className="app-shell">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="app-header">
        <Link to="/" className="brand" data-testid="brand-link">
          <span className="brand__icon" aria-hidden="true">
            ◉
          </span>
          <span>
            Mistério<span className="brand__accent">Box</span>
          </span>
        </Link>
        {user && (
          <nav className="app-header__nav" aria-label="Menu do usuário">
            <span className="app-header__user" data-testid="current-user-name">
              Detetive {user.name}
            </span>
            <Link to="/" className="button button--ghost button--small" data-testid="nav-catalog">
              Casos
            </Link>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              Sair
            </button>
          </nav>
        )}
      </header>
      <main id="conteudo" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="app-footer">
        MistérioBox — histórias fictícias para investigar com lógica e atenção.
      </footer>
    </div>
  );
}
