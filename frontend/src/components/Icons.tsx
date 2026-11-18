import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Ícones decorativos em SVG (sem dependências). Sempre ocultos para leitores de tela. */
function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MagnifierIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </BaseIcon>
);

export const LockIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </BaseIcon>
);

export const DocumentIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </BaseIcon>
);

export const EnvelopeIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="6" width="18" height="13" rx="1.5" />
    <path d="m3.5 7 8.5 6.5L20.5 7" />
  </BaseIcon>
);

export const LightbulbIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </BaseIcon>
);

export const GavelIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m14 4 6 6M11 7l6 6M12.5 5.5l-5 5M18.5 11.5l-5 5M10 13l-7 7" />
  </BaseIcon>
);

export const UsersIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
  </BaseIcon>
);

export const ClockIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </BaseIcon>
);

export const CheckIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </BaseIcon>
);

export const CrossIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </BaseIcon>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </BaseIcon>
);

export const FlagIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </BaseIcon>
);
