import { randomBytes } from 'node:crypto';

function readInteger(variableName: string, fallback: number): number {
  const rawValue = process.env[variableName];
  if (rawValue === undefined || rawValue.trim() === '') {
    return fallback;
  }
  const parsedValue = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new Error(`Variável de ambiente ${variableName} inválida: "${rawValue}".`);
  }
  return parsedValue;
}

/** Valor opcional de texto; `undefined` quando ausente ou vazio. */
export function readOptionalString(variableName: string): string | undefined {
  const rawValue = process.env[variableName]?.trim();
  return rawValue ? rawValue : undefined;
}

function readJwtSecret(): string {
  const configuredSecret = readOptionalString('JWT_SECRET');
  if (configuredSecret) {
    return configuredSecret;
  }
  console.warn(
    '[config] JWT_SECRET não definido. Um segredo temporário foi gerado; ' +
      'os tokens deixarão de valer quando a API reiniciar.',
  );
  return randomBytes(32).toString('hex');
}

export const env = {
  port: readInteger('PORT', 3333),
  jwtSecret: readJwtSecret(),
  jwtExpiresInSeconds: readInteger('JWT_EXPIRES_IN_SECONDS', 28800),
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
  bcryptSaltRounds: readInteger('BCRYPT_SALT_ROUNDS', 10),
} as const;
