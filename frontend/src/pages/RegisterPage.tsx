import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../api/client';
import { AuthScene } from '../components/AuthScene';
import { ErrorAlert } from '../components/Feedback';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/auth-context';
import type { ValidationIssue } from '../types/api';
import { validateName, validatePassword } from '../utils/validation';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const EMPTY_FORM: RegisterForm = { name: '', email: '', password: '', passwordConfirmation: '' };

function validateRegister(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Informe um e-mail válido.';
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  if (form.passwordConfirmation !== form.password) {
    errors.passwordConfirmation = 'As senhas não coincidem.';
  }
  return errors;
}

function mapApiValidationErrors(error: unknown): RegisterErrors {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const errors: RegisterErrors = {};
  for (const issue of error.details as ValidationIssue[]) {
    if (issue.field === 'name' || issue.field === 'email' || issue.field === 'password') {
      errors[issue.field] = issue.message;
    }
  }
  return errors;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof RegisterForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateRegister(form);
    setFieldErrors(errors);
    setSubmitError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (error) {
      setFieldErrors(mapApiValidationErrors(error));
      setSubmitError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthScene>
      <section className="auth-card dossier" aria-labelledby="register-title">
        <p className="dossier__stamp" aria-hidden="true">
          Novo recruta
        </p>
        <h1 id="register-title" className="auth-card__title">
          Cadastro de detetive
        </h1>
        <p className="auth-card__subtitle">Crie sua credencial para começar a investigar.</p>

        {submitError && <ErrorAlert message={submitError} testId="register-error" />}

        <form className="form" onSubmit={handleSubmit} noValidate data-testid="register-form">
          <FormField
            id="register-name"
            label="Nome"
            autoComplete="name"
            hint="Letras (com ou sem acento), espaços, hífens e apóstrofos. Até 80 caracteres."
            value={form.name}
            onChange={(event) => updateField('name')(event.target.value)}
            error={fieldErrors.name}
            testId="register-name"
            required
          />
          <FormField
            id="register-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField('email')(event.target.value)}
            error={fieldErrors.email}
            testId="register-email"
            required
          />
          <FormField
            id="register-password"
            label="Senha"
            type="password"
            autoComplete="new-password"
            hint="De 8 a 72 caracteres, com letras e números."
            value={form.password}
            onChange={(event) => updateField('password')(event.target.value)}
            error={fieldErrors.password}
            testId="register-password"
            required
          />
          <FormField
            id="register-password-confirmation"
            label="Confirme a senha"
            type="password"
            autoComplete="new-password"
            value={form.passwordConfirmation}
            onChange={(event) => updateField('passwordConfirmation')(event.target.value)}
            error={fieldErrors.passwordConfirmation}
            testId="register-password-confirmation"
            required
          />
          <button
            type="submit"
            className="button button--primary button--block"
            disabled={submitting}
            data-testid="register-submit"
          >
            {submitting ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>
        <p className="auth-card__switch">
          Já tem conta?{' '}
          <Link to="/login" data-testid="link-login">
            Entrar
          </Link>
        </p>
      </section>
    </AuthScene>
  );
}
