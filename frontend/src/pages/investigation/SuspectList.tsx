import type { Suspect } from '../../types/api';

export function SuspectList({ suspects }: { suspects: Suspect[] }) {
  return (
    <ul className="suspect-grid" data-testid="suspect-list">
      {suspects.map((suspect) => (
        <li key={suspect.id}>
          <article className="suspect-card" data-testid={`suspect-card-${suspect.id}`}>
            <div className="suspect-card__photo" aria-hidden="true">
              {suspect.name
                .split(' ')
                .filter((part) => part.length > 2)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')}
            </div>
            <div>
              <h3 className="suspect-card__name">{suspect.name}</h3>
              <p className="suspect-card__role">{suspect.role}</p>
              <p className="suspect-card__description">{suspect.description}</p>
              <blockquote
                className="suspect-card__testimony"
                data-testid={`suspect-testimony-${suspect.id}`}
              >
                <span className="visually-hidden">Depoimento: </span>“{suspect.testimony}”
              </blockquote>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
