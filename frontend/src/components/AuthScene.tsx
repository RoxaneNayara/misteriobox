import type { ReactNode } from 'react';
import { MagnifierIcon } from './Icons';

interface AuthSceneProps {
  children: ReactNode;
}

/** Cenário cinematográfico das telas de login e cadastro. */
export function AuthScene({ children }: AuthSceneProps) {
  return (
    <div className="auth-scene">
      <aside className="auth-scene__intro" aria-label="Sobre a MistérioBox">
        <div className="auth-scene__spotlight" aria-hidden="true" />
        <span className="auth-scene__lens" aria-hidden="true">
          <MagnifierIcon />
        </span>
        <p className="auth-scene__eyebrow">Agência MistérioBox</p>
        <p className="auth-scene__headline">
          Toda verdade deixa <em>uma pista</em>.
        </p>
        <ul className="auth-scene__features">
          <li>Examine evidências e confronte depoimentos.</li>
          <li>Desbloqueie documentos ocultos pista a pista.</li>
          <li>Faça uma única acusação e receba sua patente.</li>
        </ul>
      </aside>
      <div className="auth-scene__panel">{children}</div>
    </div>
  );
}
