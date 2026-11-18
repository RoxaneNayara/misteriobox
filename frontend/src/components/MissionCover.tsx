import type { ReactElement } from 'react';

/**
 * Capas ilustradas das missões (SVG puramente decorativo, sem dados do caso).
 * A escolha da arte usa apenas o identificador público da missão; missões sem
 * arte própria recebem a capa genérica.
 */

function TheaterCover() {
  return (
    <>
      <defs>
        <radialGradient id="cover-theater-spot" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#f3d98b" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#c9a54a" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cover-theater-curtain" x1="0" x2="1">
          <stop offset="0%" stopColor="#3b0d10" />
          <stop offset="50%" stopColor="#6e1a1f" />
          <stop offset="100%" stopColor="#2a0709" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="#0d0a09" />
      <g className="cover__flicker">
        <path d="M160 0h80l70 240H90z" fill="url(#cover-theater-spot)" />
      </g>
      <rect y="200" width="400" height="40" fill="#1b1310" />
      <path d="M0 200h400" stroke="#c9a54a" strokeOpacity="0.35" />
      {[0, 22, 44, 66].map((x) => (
        <path
          key={`l${x}`}
          d={`M${x} 0q14 120 -4 240h26q-16 -120 0 -240z`}
          fill="url(#cover-theater-curtain)"
        />
      ))}
      {[310, 332, 354, 376].map((x) => (
        <path
          key={`r${x}`}
          d={`M${x} 0q-14 120 4 240h26q16 -120 0 -240z`}
          fill="url(#cover-theater-curtain)"
        />
      ))}
      <path d="M0 0h400v26q-100 18-200 0T0 26z" fill="#4e1216" />
      <path d="M0 26q100 18 200 0t200 0" stroke="#c9a54a" strokeOpacity="0.6" fill="none" />
      {/* Estojo aberto e vazio sob o holofote */}
      <g transform="translate(200 188)">
        <ellipse rx="70" ry="9" fill="#000" opacity="0.6" />
        <path
          d="M-58 -6c4-18 30-22 46-12 10 6 26 6 36 0 16-10 34-2 34 12z"
          fill="#2a1d14"
          stroke="#c9a54a"
          strokeWidth="1.5"
        />
        <path d="M-46 -9c4-10 22-12 32-5 9 6 24 6 32 0 12-7 24-2 26 6z" fill="#5c1f22" />
      </g>
      {/* Silhueta do violino desaparecendo */}
      <g transform="translate(200 108) rotate(-14)" opacity="0.5" className="cover__float">
        <rect x="-3" y="-62" width="6" height="40" fill="#c9a54a" />
        <circle cy="-66" r="6" fill="none" stroke="#c9a54a" strokeWidth="2" />
        <path
          d="M0-24c-16 0-24 8-22 20 1 7-6 9-6 16 0 14 12 22 28 22s28-8 28-22c0-7-7-9-6-16 2-12-6-20-22-20z"
          fill="none"
          stroke="#e0c06a"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      </g>
      {[60, 120, 260, 300, 340].map((x, index) => (
        <circle key={x} cx={x} cy={40 + index * 30} r="1.2" fill="#f3d98b" opacity="0.5" />
      ))}
    </>
  );
}

function HotelCover() {
  return (
    <>
      <defs>
        <linearGradient id="cover-hotel-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#141c24" />
          <stop offset="100%" stopColor="#0b0f14" />
        </linearGradient>
        <linearGradient id="cover-hotel-light" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3d98b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f3d98b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#cover-hotel-wall)" />
      {/* Corredor em perspectiva */}
      <path d="M0 0l140 70v110L0 240z" fill="#1a232d" />
      <path d="M400 0 260 70v110l140 60z" fill="#1a232d" />
      <path d="M0 240l140-60h120l140 60z" fill="#2a1a14" />
      <path
        d="M0 240l140-60M400 240 260 180M70 240l100-60M330 240l-100-60"
        stroke="#c9a54a"
        strokeOpacity="0.15"
      />
      {[30, 80, 320, 370].map((x) => (
        <rect
          key={x}
          x={x < 200 ? x : x - 18}
          y={x < 200 ? 60 + x / 4 : 60 + (400 - x) / 4}
          width="18"
          height={x < 200 ? 130 - x / 2 : 130 - (400 - x) / 2}
          fill="#0e141a"
          stroke="#c9a54a"
          strokeOpacity="0.2"
        />
      ))}
      {/* Porta 307 */}
      <rect
        x="168"
        y="76"
        width="64"
        height="104"
        fill="#3a2418"
        stroke="#7a5a2e"
        strokeWidth="2"
      />
      <rect x="176" y="86" width="48" height="36" fill="none" stroke="#7a5a2e" />
      <rect x="176" y="130" width="48" height="40" fill="none" stroke="#7a5a2e" />
      <rect x="186" y="96" width="28" height="14" rx="2" fill="#c9a54a" />
      <text
        x="200"
        y="107"
        textAnchor="middle"
        fontSize="11"
        fontFamily="Georgia, serif"
        fill="#2a2119"
        fontWeight="700"
      >
        307
      </text>
      <circle cx="222" cy="132" r="2.5" fill="#e0c06a" />
      <rect x="168" y="178" width="64" height="3" fill="#f3d98b" className="cover__flicker" />
      <path
        d="M168 181h64l18 20h-100z"
        fill="url(#cover-hotel-light)"
        opacity="0.5"
        className="cover__flicker"
      />
      {/* Cartão-chave esquecido */}
      <g transform="translate(258 208) rotate(-18)">
        <rect width="30" height="19" rx="2" fill="#e8dcc0" />
        <rect x="3" y="4" width="24" height="3" fill="#2a2119" />
      </g>
      {/* Luminárias */}
      {[110, 290].map((x) => (
        <g key={x}>
          <circle cx={x} cy="58" r="4" fill="#f3d98b" opacity="0.8" />
          <circle cx={x} cy="58" r="16" fill="#f3d98b" opacity="0.08" />
        </g>
      ))}
    </>
  );
}

function LetterCover() {
  return (
    <>
      <defs>
        <radialGradient id="cover-letter-glow" cx="80%" cy="90%" r="70%">
          <stop offset="0%" stopColor="#e2742b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cover-letter-candle" cx="18%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#f3d98b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="#140d09" />
      <rect width="400" height="240" fill="url(#cover-letter-candle)" className="cover__flicker" />
      <rect width="400" height="240" fill="url(#cover-letter-glow)" />
      {/* Mesa de madeira */}
      {[40, 90, 140, 190, 230].map((y) => (
        <path key={y} d={`M0 ${y}q200 8 400 0`} stroke="#2a1b12" fill="none" />
      ))}
      {/* Carta */}
      <g transform="translate(205 122) rotate(-7)">
        <rect x="-92" y="-72" width="184" height="144" fill="#e8dcc0" />
        <path d="M92 40 60 72h32z" fill="#3a2418" opacity="0.85" />
        <path d="M60 72 92 40l-6 30z" fill="#c9b48c" />
        {[-48, -34, -20, -6, 8, 22].map((y, index) => (
          <path
            key={y}
            d={`M-74 ${y}h${index === 5 ? 90 : 148}`}
            stroke="#6b5640"
            strokeWidth="1.4"
            strokeDasharray={index % 2 ? '4 3 12 3' : '10 3 6 3'}
          />
        ))}
        <text
          x="-74"
          y="-56"
          fontSize="11"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill="#4a3826"
        >
          14 de novembro de 1979
        </text>
        <circle cx="52" cy="46" r="15" fill="#8f2f25" />
        <circle cx="52" cy="46" r="10" fill="none" stroke="#c04a3c" strokeWidth="2" />
        <text
          x="52"
          y="50"
          textAnchor="middle"
          fontSize="11"
          fontFamily="Georgia, serif"
          fill="#e8dcc0"
          fontWeight="700"
        >
          A
        </text>
      </g>
      {/* Vela */}
      <g transform="translate(64 70)">
        <rect x="-7" y="10" width="14" height="60" fill="#e8dcc0" />
        <path d="M0 -8c6 8 5 14 0 18-5-4-6-10 0-18z" fill="#f3d98b" className="cover__flicker" />
        <rect x="-18" y="68" width="36" height="6" rx="2" fill="#7a5a2e" />
      </g>
      {/* Chamas ao fundo, lembrança do incêndio */}
      <g opacity="0.6" className="cover__flicker">
        <path
          d="M330 240c-10-30 10-40 4-66 18 16 22 34 16 48 8-6 10-16 8-24 14 16 14 32 4 42z"
          fill="#e2742b"
        />
        <path d="M352 240c-6-16 4-24 2-36 10 10 12 22 8 36z" fill="#f3d98b" />
      </g>
    </>
  );
}

function GenericCover() {
  return (
    <>
      <rect width="400" height="240" fill="#141110" />
      <circle cx="190" cy="110" r="46" fill="none" stroke="#c9a54a" strokeWidth="10" />
      <path d="M224 144l52 52" stroke="#c9a54a" strokeWidth="14" strokeLinecap="round" />
    </>
  );
}

const COVERS: Record<string, () => ReactElement> = {
  'missao-001': TheaterCover,
  'missao-002': HotelCover,
  'missao-003': LetterCover,
};

interface MissionCoverProps {
  missionId: string;
  className?: string;
}

export function MissionCover({ missionId, className = '' }: MissionCoverProps) {
  const Artwork = COVERS[missionId] ?? GenericCover;
  return (
    <svg
      className={`cover ${className}`}
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <Artwork />
    </svg>
  );
}
