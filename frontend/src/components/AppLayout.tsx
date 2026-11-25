import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useCssHeightVariable } from '../hooks/useCssHeightVariable';
import { initialOf } from '../utils/labels';
import { MagnifierIcon } from './Icons';

export function AppLayout() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  // B05: elementos fixos da página usam a altura real do cabeçalho.
  useCssHeightVariable(headerRef, '--app-header-height');

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
      <header ref={headerRef} className="app-header">
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
                {initialOf(user.name)}
              </span>
              <span
                className="app-header__user-name"
                title={`Detetive ${user.name}`}
                data-testid="current-user-name"
              >
                Detetive {user.name}
              </span>
            </span>
            <NavLink
              to="/"
              end
              className="button button--ghost button--small"
              data-testid="nav-catalog"
            >
              Casos
            </NavLink>
            <NavLink
              to="/historico"
              className="button button--ghost button--small"
              data-testid="nav-history"
            >
              Meu histórico
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
        {status === 'anonymous' && (
          <nav className="app-header__nav" aria-label="Acesso">
            <NavLink
              to="/login"
              className="button button--ghost button--small"
              data-testid="nav-login"
            >
              Entrar
            </NavLink>
            <NavLink
              to="/cadastro"
              className="button button--secondary button--small"
              data-testid="nav-register"
            >
              Cadastrar
            </NavLink>
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
        <p className="app-footer__quote">Os fatos não mentem. As pessoas, às vezes.</p>
        <p className="app-footer__credit">MistérioBox · Histórias fictícias para investigar.</p>
      </footer>
    </div>
  );
}
