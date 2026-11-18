import { Link } from 'react-router-dom';
import { MagnifierIcon } from '../components/Icons';

export function NotFoundPage() {
  return (
    <section className="not-found" data-testid="not-found-page">
      <span className="not-found__icon" aria-hidden="true">
        <MagnifierIcon />
      </span>
      <p className="page-header__eyebrow">Erro 404 · Arquivo extraviado</p>
      <h1 className="not-found__title">Página não encontrada</h1>
      <p>Este arquivo não existe ou foi movido.</p>
      <Link to="/" className="button button--primary">
        Voltar ao início
      </Link>
    </section>
  );
}
