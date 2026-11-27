import { randomBytes } from 'node:crypto';

type EnvSource = Record<string, string | undefined>;

/** Bancos de prévia são identificados pelo nome (ex.: misteriobox-preview). */
const PREVIEW_DB_PATTERN = /(^|[-_])preview($|[-_])/i;

/** Tamanho mínimo do JWT_SECRET em ambientes publicados (32 bytes em hexadecimal = 64). */
export const MIN_PRODUCTION_JWT_SECRET_LENGTH = 32;

function readIntegerFrom(source: EnvSource, variableName: string, fallback: number): number {
  const rawValue = source[variableName];
  if (rawValue === undefined || rawValue.trim() === '') {
    return fallback;
  }
  const parsedValue = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new Error(`Variável de ambiente ${variableName} inválida: "${rawValue}".`);
  }
  return parsedValue;
}

function readStringFrom(source: EnvSource, variableName: string): string | undefined {
  const rawValue = source[variableName]?.trim();
  return rawValue ? rawValue : undefined;
}

/** Valor opcional de texto; `undefined` quando ausente ou vazio. */
export function readOptionalString(variableName: string): string | undefined {
  return readStringFrom(process.env, variableName);
}

function readBooleanFrom(source: EnvSource, variableName: string): boolean | undefined {
  const rawValue = readStringFrom(source, variableName)?.toLowerCase();
  if (rawValue === undefined) return undefined;
  if (['true', '1', 'yes', 'sim'].includes(rawValue)) return true;
  if (['false', '0', 'no', 'nao', 'não'].includes(rawValue)) return false;
  throw new Error(`Variável de ambiente ${variableName} inválida: use true ou false.`);
}

/**
 * Ambiente publicado: produção (NODE_ENV=production) ou qualquer implantação na Vercel
 * (VERCEL=1, inclusive as prévias). Nesses ambientes não existe banco em memória,
 * usuários demonstrativos nem segredo temporário.
 */
export function isDeployedEnvironment(source: EnvSource = process.env): boolean {
  return source.NODE_ENV === 'production' || source.VERCEL === '1';
}

/**
 * Lê e valida a configuração. Em ambiente publicado, a ausência de variáveis obrigatórias
 * interrompe a inicialização com a lista de nomes — nunca com os valores.
 */
export function loadEnv(source: EnvSource = process.env) {
  const deployed = isDeployedEnvironment(source);
  const mongodbUri = readStringFrom(source, 'MONGODB_URI');
  const configuredSecret = readStringFrom(source, 'JWT_SECRET');

  if (deployed) {
    const problems: string[] = [];
    if (!mongodbUri) problems.push('MONGODB_URI é obrigatória (banco persistente).');
    if (!configuredSecret) {
      problems.push('JWT_SECRET é obrigatória.');
    } else if (configuredSecret.length < MIN_PRODUCTION_JWT_SECRET_LENGTH) {
      problems.push(
        `JWT_SECRET deve ter pelo menos ${MIN_PRODUCTION_JWT_SECRET_LENGTH} caracteres.`,
      );
    }
    if (mongodbUri && !/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
      problems.push('MONGODB_URI deve começar com mongodb:// ou mongodb+srv://.');
    }
    if (readBooleanFrom(source, 'SEED_DEMO_USERS') === true) {
      problems.push('SEED_DEMO_USERS não pode ser true em ambiente publicado.');
    }
    // Isolamento dos dados dos jogadores: prévias e produção nunca usam o mesmo banco.
    const vercelEnv = source.VERCEL_ENV;
    const dbName = readStringFrom(source, 'MONGODB_DB_NAME');
    if (vercelEnv === 'preview' || vercelEnv === 'production') {
      if (!dbName) {
        problems.push('MONGODB_DB_NAME é obrigatória na Vercel (bancos separados por ambiente).');
      } else if (vercelEnv === 'preview' && !PREVIEW_DB_PATTERN.test(dbName)) {
        problems.push(
          'Em Preview, MONGODB_DB_NAME deve indicar um banco de prévia (ex.: misteriobox-preview).',
        );
      } else if (vercelEnv === 'production' && PREVIEW_DB_PATTERN.test(dbName)) {
        problems.push('Em Production, MONGODB_DB_NAME não pode apontar para um banco de prévia.');
      }
    }
    if (problems.length > 0) {
      throw new Error(`[config] Configuração de produção incompleta:\n- ${problems.join('\n- ')}`);
    }
  }

  let jwtSecret = configuredSecret;
  if (!jwtSecret) {
    console.warn(
      '[config] JWT_SECRET não definido. Um segredo temporário foi gerado; ' +
        'os tokens deixarão de valer quando a API reiniciar.',
    );
    jwtSecret = randomBytes(32).toString('hex');
  }

  return {
    deployed,
    port: readIntegerFrom(source, 'PORT', 3333),
    jwtSecret,
    /** Expiração absoluta da sessão, contada a partir do login (8 horas). */
    jwtExpiresInSeconds: readIntegerFrom(source, 'JWT_EXPIRES_IN_SECONDS', 28800),
    /** Expiração por inatividade (B04): sem renovação nesse intervalo, a sessão termina. */
    sessionIdleTimeoutSeconds: readIntegerFrom(source, 'SESSION_IDLE_TIMEOUT_SECONDS', 1800),
    /** Origens autorizadas pelo CORS (lista separada por vírgulas). */
    corsOrigins: (readStringFrom(source, 'CORS_ORIGIN') ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    bcryptSaltRounds: readIntegerFrom(source, 'BCRYPT_SALT_ROUNDS', 10),
    /** Banco persistente (MongoDB Atlas ou compatível). Ausente: MongoDB em memória (local/testes). */
    mongodbUri,
    mongodbDbName: readStringFrom(source, 'MONGODB_DB_NAME') ?? 'misteriobox',
    /** Usuários demonstrativos: padrão ligado só localmente; sempre desligado se publicado. */
    seedDemoUsers: deployed ? false : (readBooleanFrom(source, 'SEED_DEMO_USERS') ?? true),
  } as const;
}

export type AppEnv = ReturnType<typeof loadEnv>;

export const env: AppEnv = loadEnv();
