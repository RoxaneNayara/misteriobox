import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { AuthScene } from '../components/AuthScene';
import { ErrorAlert } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/auth-context';

interface LoginErrors {
  email?: string;
  password?: string;
}

interface LoginLocationState {
  from?: string;
  loggedOut?: boolean;
}

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Informe um e-mail válido.';
  if (!password) errors.password = 'Informe a senha.';
  return errors;
}

export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const locationState = (useLocation().state ?? {}) as LoginLocationState;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateLogin(email, password);
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(locationState.from ?? '/', { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthScene>
      <section className="auth-card dossier" aria-labelledby="login-title">
        <p className="dossier__stamp" aria-hidden="true">
          Acesso restrito
        </p>
        <h1 id="login-title" className="auth-card__title">
          Entrar na agência
        </h1>
        <p className="auth-card__subtitle">
          Identifique-se para acessar os arquivos confidenciais.
        </p>

        {locationState.loggedOut && (
          <p className="alert alert--info" data-testid="logout-message">
            Você saiu da plataforma. Suas investigações em andamento continuam salvas.
          </p>
        )}
        {sessionExpired && (
          <p className="alert alert--info" data-testid="session-expired-message">
            Sua sessão expirou. Entre novamente para continuar.
          </p>
        )}
        {submitError && <ErrorAlert message={submitError} testId="login-error" />}

        <form className="form" onSubmit={handleSubmit} noValidate data-testid="login-form">
          <FormField
            id="login-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            testId="login-email"
            required
          />
          <FormField
            id="login-password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            testId="login-password"
            required
          />
          <button
            type="submit"
            className="button button--primary button--block"
            disabled={submitting}
            data-testid="login-submit"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="auth-card__switch">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" data-testid="link-register">
            Cadastre-se como detetive
          </Link>
        </p>
      </section>
    </AuthScene>
  );
}
