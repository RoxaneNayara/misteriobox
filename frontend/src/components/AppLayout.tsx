import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { MagnifierIcon } from './Icons';

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
            <MagnifierIcon />
          </span>
          <span className="brand__name">
            Mistério<span className="brand__accent">Box</span>
          </span>
        </Link>
        {user && (
          <nav className="app-header__nav" aria-label="Menu do usuário">
            <span className="app-header__user">
              <span className="app-header__badge" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span data-testid="current-user-name">Detetive {user.name}</span>
            </span>
            <NavLink
              to="/"
              end
              className="button button--ghost button--small"
              data-testid="nav-catalog"
            >
              Casos
            </NavLink>
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
        <div className="page-transition" key={pathname}>
          <Outlet />
        </div>
      </main>
      <footer className="app-footer">
        <span className="app-footer__line" aria-hidden="true" />
        MistérioBox · Histórias fictícias para investigar com lógica e atenção.
      </footer>
    </div>
  );
}
