/** Código do MongoDB para violação de índice único. */
const MONGO_DUPLICATE_KEY_CODE = 11000;

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === MONGO_DUPLICATE_KEY_CODE
  );
}

/** Etapa da preparação do banco em que a falha ocorreu. */
export type DatabaseSetupPhase = 'conexao' | 'indices' | 'carga-inicial';

/** Falha na preparação do banco, marcada com a etapa; o erro original fica em `cause`. */
export class DatabaseSetupError extends Error {
  constructor(
    readonly phase: DatabaseSetupPhase,
    cause: unknown,
  ) {
    super(`Falha na preparação do banco (etapa: ${phase}).`, { cause });
    this.name = 'DatabaseSetupError';
  }
}

export async function withSetupPhase<T>(
  phase: DatabaseSetupPhase,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof DatabaseSetupError) throw error;
    throw new DatabaseSetupError(phase, error);
  }
}

/** Metadados seguros para o log: nunca inclui a mensagem, a URI, o usuário ou a senha. */
export interface DatabaseErrorDiagnostic {
  phase: DatabaseSetupPhase | 'desconhecida';
  name: string;
  code?: number | string;
  codeName?: string;
  category: string;
}

const SAFE_NAME = /^[A-Za-z]{1,64}$/;
const SAFE_CODE_NAME = /^[A-Za-z0-9_]{1,64}$/;
const SAFE_STRING_CODE = /^[A-Z0-9_]{1,32}$/;

/** Categoria provável, para orientar a verificação no Atlas (ver docs/implantacao.md). */
function categorize(name: string, code: number | string | undefined): string {
  if (code === 18 || code === 8000) return 'autenticacao';
  if (code === 13) return 'permissao';
  if (code === 85 || code === 86) return 'indice-conflitante';
  if (code === MONGO_DUPLICATE_KEY_CODE) return 'chave-duplicada';
  if (name === 'MongoServerSelectionError' || name === 'MongoNetworkError') return 'rede';
  if (name === 'MongoParseError') return 'uri-invalida';
  return 'outra';
}

export function describeDatabaseError(error: unknown): DatabaseErrorDiagnostic {
  const phase = error instanceof DatabaseSetupError ? error.phase : 'desconhecida';
  const original = error instanceof DatabaseSetupError ? error.cause : error;
  const record = typeof original === 'object' && original !== null ? original : {};

  const rawName = 'name' in record ? record.name : undefined;
  const name = typeof rawName === 'string' && SAFE_NAME.test(rawName) ? rawName : 'Error';

  const rawCode = 'code' in record ? record.code : undefined;
  const code =
    (typeof rawCode === 'number' && Number.isInteger(rawCode)) ||
    (typeof rawCode === 'string' && SAFE_STRING_CODE.test(rawCode))
      ? rawCode
      : undefined;

  const rawCodeName = 'codeName' in record ? record.codeName : undefined;
  const codeName =
    typeof rawCodeName === 'string' && SAFE_CODE_NAME.test(rawCodeName) ? rawCodeName : undefined;

  return {
    phase,
    name,
    ...(code === undefined ? {} : { code }),
    ...(codeName === undefined ? {} : { codeName }),
    category: categorize(name, code),
  };
}
