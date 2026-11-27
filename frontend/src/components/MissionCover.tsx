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

/** Fundo comum das capas novas: escuridão com foco de luz dourado. */
function Spotlight({ id, cx = '50%' }: { id: string; cx?: string }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx={cx} cy="35%" r="70%">
          <stop offset="0%" stopColor="#f3d98b" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#c9a54a" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="#0e0b0a" />
      <rect width="400" height="240" fill={`url(#${id})`} className="cover__flicker" />
    </>
  );
}

function SignatureCover() {
  return (
    <>
      <Spotlight id="cover-signature-spot" />
      <g transform="translate(200 122) rotate(-6)">
        <rect x="-86" y="-92" width="172" height="190" rx="3" fill="#e9dcbc" />
        {[-62, -46, -30, -14].map((y) => (
          <path
            key={y}
            d={`M-64 ${y}h128`}
            stroke="#8a775a"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <path d="M-64 2h84" stroke="#8a775a" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M-56 50c14-26 22 14 34-6s16-18 22 0 14 8 24-6 18 4 30-4"
          fill="none"
          stroke="#1d3b6b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M-64 64h128" stroke="#8a775a" strokeWidth="1.5" />
        <circle cx="52" cy="22" r="17" fill="#7a1c1c" />
        <circle cx="52" cy="22" r="11" fill="none" stroke="#c9a54a" strokeWidth="1.5" />
      </g>
      <g transform="translate(286 70) rotate(36)">
        <rect x="-4" y="-60" width="8" height="96" rx="3" fill="#c9a54a" />
        <path d="M-4 36l4 18 4-18z" fill="#e6c873" />
      </g>
      <text x="40" y="214" fill="#c9a54a" fontSize="15" letterSpacing="4" opacity="0.75">
        LOTE 47
      </text>
    </>
  );
}

function TrophyCover() {
  return (
    <>
      <Spotlight id="cover-trophy-spot" />
      <ellipse cx="200" cy="206" rx="110" ry="10" fill="#000" opacity="0.6" />
      <g fill="#c9a54a" stroke="#e6c873" strokeWidth="1.5">
        <rect x="160" y="182" width="80" height="18" rx="2" />
        <rect x="184" y="150" width="32" height="34" />
        <path d="M146 54h108v20c0 46-26 76-54 76s-54-30-54-76z" />
        <path
          d="M146 66h-22c0 30 14 46 30 48M254 66h22c0 30-14 46-30 48"
          fill="none"
          strokeWidth="6"
        />
      </g>
      <rect x="168" y="186" width="64" height="10" fill="#1a1410" />
      <text x="200" y="195" textAnchor="middle" fill="#c9a54a" fontSize="9" letterSpacing="2">
        ? ? ? ? ?
      </text>
      <g transform="translate(296 118) rotate(18)" opacity="0.8">
        <path d="M-26-12h52v24h-52z" fill="#ebdfc3" />
        <path d="M-26-12l26 16 26-16" fill="none" stroke="#8a775a" strokeWidth="2" />
      </g>
    </>
  );
}

function FrameCover() {
  return (
    <>
      <Spotlight id="cover-frame-spot" />
      <rect
        x="112"
        y="34"
        width="176"
        height="160"
        fill="#2a1f15"
        stroke="#c9a54a"
        strokeWidth="14"
      />
      <rect x="126" y="48" width="148" height="132" fill="none" stroke="#8a6d2a" strokeWidth="3" />
      <rect x="132" y="54" width="136" height="120" fill="#1b2430" />
      <path
        d="M152 158v-70a22 22 0 0 1 44 0v70M214 158v-70a22 22 0 0 1 44 0v70"
        fill="none"
        stroke="#95bad0"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path
        d="M172 160c0-26 10-40 28-40s28 14 28 40"
        fill="none"
        stroke="#e9dcbc"
        strokeWidth="2"
        strokeDasharray="5 4"
      />
      <circle
        cx="200"
        cy="104"
        r="12"
        fill="none"
        stroke="#e9dcbc"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle cx="270" cy="186" r="12" fill="#7a1c1c" stroke="#c9a54a" strokeWidth="1.5" />
      <path d="M96 216h208" stroke="#c9a54a" strokeOpacity="0.35" />
    </>
  );
}

function BallotCover() {
  return (
    <>
      <Spotlight id="cover-ballot-spot" />
      <g transform="translate(200 150)">
        <path d="M-80-30h160l-12 82h-136z" fill="#24201b" stroke="#c9a54a" strokeWidth="2" />
        <rect
          x="-84"
          y="-40"
          width="168"
          height="14"
          fill="#2d241c"
          stroke="#c9a54a"
          strokeWidth="2"
        />
        <rect x="-30" y="-36" width="60" height="5" fill="#080706" />
        <text y="22" textAnchor="middle" fill="#c9a54a" fontSize="14" letterSpacing="5">
          VOTO
        </text>
      </g>
      <g transform="translate(206 70) rotate(-8)">
        <rect x="-34" y="-46" width="68" height="84" fill="#ebdfc3" />
        <text y="-6" textAnchor="middle" fill="#261d15" fontSize="18" fontWeight="700">
          SIM
        </text>
        <path d="M-20 14h40M-20 24h28" stroke="#8a775a" strokeWidth="2" />
      </g>
      {[70, 102, 298, 330].map((x) => (
        <g key={x} opacity="0.45">
          <circle cx={x} cy="96" r="10" fill="#3a3129" />
          <path d={`M${x - 16} 132q16-26 32 0`} fill="#3a3129" />
        </g>
      ))}
    </>
  );
}

function ProtocolCover() {
  return (
    <>
      <Spotlight id="cover-protocol-spot" />
      <rect
        x="92"
        y="38"
        width="216"
        height="140"
        rx="6"
        fill="#0b1218"
        stroke="#c9a54a"
        strokeWidth="3"
      />
      <rect x="176" y="178" width="48" height="18" fill="#2d241c" />
      <rect x="146" y="196" width="108" height="8" rx="2" fill="#3a3129" />
      {[0, 1, 2, 3, 4, 5, 6].map((line) => (
        <path
          key={line}
          d={`M108 ${60 + line * 16}h${line === 3 ? 172 : 90 + ((line * 37) % 80)}`}
          stroke={line === 3 ? '#e3806f' : '#95bad0'}
          strokeOpacity={line === 3 ? 0.9 : 0.45}
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}
      <path d="M104 108h188" stroke="#e3806f" strokeWidth="2" />
      <text x="292" y="72" textAnchor="end" fill="#c9a54a" fontSize="20" fontWeight="700">
        0
      </text>
      <text x="40" y="226" fill="#c9a54a" fontSize="10" letterSpacing="3" opacity="0.6">
        02:13 · 10.8.4.22
      </text>
    </>
  );
}

function TestamentCover() {
  return (
    <>
      <Spotlight id="cover-testament-spot" cx="45%" />
      <g transform="translate(184 120) rotate(4)">
        <rect x="-78" y="-88" width="156" height="180" fill="#e9dcbc" />
        <rect x="-70" y="-80" width="156" height="180" fill="#d8c7a1" opacity="0.5" />
        <text y="-56" textAnchor="middle" fill="#261d15" fontSize="13" letterSpacing="4">
          TESTAMENTO
        </text>
        {[-36, -22, -8, 6].map((y) => (
          <path key={y} d={`M-58 ${y}h116`} stroke="#8a775a" strokeWidth="2.5" />
        ))}
        {[-48, -6, 34].map((x) => (
          <path
            key={x}
            d={`M${x - 14} 64c6-10 10 6 16-2s8-8 12 2`}
            fill="none"
            stroke="#1d3b6b"
            strokeWidth="2"
          />
        ))}
        <path d="M-60 52h120" stroke="#8a775a" strokeDasharray="3 3" />
      </g>
      <g transform="translate(296 168)">
        <circle r="20" fill="#7a1c1c" />
        <path d="M-8-14l6 12-8 6 10 14" fill="none" stroke="#0e0b0a" strokeWidth="2.5" />
      </g>
      <g fill="#3e5f31" opacity="0.7">
        <ellipse cx="78" cy="196" rx="14" ry="6" transform="rotate(-30 78 196)" />
        <ellipse cx="96" cy="184" rx="14" ry="6" transform="rotate(20 96 184)" />
        <circle cx="86" cy="204" r="4" fill="#8f2f25" />
      </g>
    </>
  );
}

function ArchiveCover() {
  return (
    <>
      <Spotlight id="cover-archive-spot" />
      <g transform="translate(200 132)">
        <path d="M-104-36h208v100h-208z" fill="#5a4632" stroke="#2a1f15" strokeWidth="2" />
        <path d="M-112-56h224v22h-224z" fill="#6c5640" stroke="#2a1f15" strokeWidth="2" />
        <rect x="-38" y="-14" width="76" height="40" fill="#ebdfc3" />
        <text y="18" textAnchor="middle" fill="#261d15" fontSize="30" fontWeight="700">
          17
        </text>
        <rect x="-74" y="40" width="34" height="10" rx="5" fill="#2a1f15" />
        <rect x="40" y="40" width="34" height="10" rx="5" fill="#2a1f15" />
      </g>
      <g transform="translate(300 64) rotate(14)">
        <rect
          x="-36"
          y="-22"
          width="72"
          height="44"
          rx="4"
          fill="#1a1714"
          stroke="#c9a54a"
          strokeWidth="2"
        />
        <circle cx="-14" cy="-2" r="8" fill="none" stroke="#c9a54a" strokeWidth="2" />
        <circle cx="14" cy="-2" r="8" fill="none" stroke="#c9a54a" strokeWidth="2" />
        <path d="M-20 14h40" stroke="#c9a54a" strokeWidth="2" />
      </g>
      <text x="40" y="224" fill="#c9a54a" fontSize="11" letterSpacing="3" opacity="0.6">
        15 · 03 · 2016
      </text>
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
  'missao-004': SignatureCover,
  'missao-005': TrophyCover,
  'missao-006': FrameCover,
  'missao-007': BallotCover,
  'missao-008': ProtocolCover,
  'missao-009': TestamentCover,
  'missao-010': ArchiveCover,
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
