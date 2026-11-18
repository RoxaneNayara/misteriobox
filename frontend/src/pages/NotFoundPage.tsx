import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="panel" data-testid="not-found-page">
      <h1 className="panel__title">Página não encontrada</h1>
      <p>Este arquivo não existe ou foi movido.</p>
      <Link to="/" className="button button--primary">
        Voltar ao início
      </Link>
    </section>
  );
}
