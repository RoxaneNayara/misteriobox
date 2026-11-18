import type { Suspect } from '../../types/api';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 2 && !part.endsWith('.'))
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

/** Galeria de suspeitos em formato de ficha policial. */
export function SuspectList({ suspects }: { suspects: Suspect[] }) {
  return (
    <ul className="suspect-grid" data-testid="suspect-list">
      {suspects.map((suspect, index) => (
        <li key={suspect.id}>
          <article
            className="suspect-card"
            data-testid={`suspect-card-${suspect.id}`}
            aria-labelledby={`suspect-name-${suspect.id}`}
          >
            <div className="suspect-card__mugshot" aria-hidden="true">
              <span className="suspect-card__initials">{initialsOf(suspect.name)}</span>
              <span className="suspect-card__plate">
                Suspeito {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="suspect-card__file">
              <h3 id={`suspect-name-${suspect.id}`} className="suspect-card__name">
                {suspect.name}
              </h3>
              <p className="suspect-card__role">{suspect.role}</p>
              <p className="suspect-card__description">{suspect.description}</p>
            </div>
            <blockquote
              className="suspect-card__testimony"
              data-testid={`suspect-testimony-${suspect.id}`}
            >
              <span className="suspect-card__testimony-label">Depoimento</span>
              <span className="visually-hidden">: </span>“{suspect.testimony}”
            </blockquote>
          </article>
        </li>
      ))}
    </ul>
  );
}
