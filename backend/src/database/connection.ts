import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env';
import { InvestigationModel } from '../models/investigation.model';
import { MissionModel } from '../models/mission.model';
import { UserModel } from '../models/user.model';

export type DatabaseMode = 'persistent' | 'memory';

export interface ConnectOptions {
  /** URI do banco persistente; padrão: MONGODB_URI. Sem URI, usa o MongoDB em memória. */
  uri?: string;
  dbName?: string;
}

let memoryServer: MongoMemoryServer | null = null;
let currentMode: DatabaseMode | null = null;

/** Modelos da aplicação: os índices são criados antes de a API aceitar requisições. */
const MODELS = [UserModel, MissionModel, InvestigationModel];

/** Identifica o servidor no log sem expor usuário, senha ou parâmetros da URI. */
function describeHost(): string {
  const { host, name } = mongoose.connection;
  return `${host ?? 'desconhecido'}/${name}`;
}

/**
 * Conecta o Mongoose.
 * - Persistente (MongoDB Atlas ou compatível): cria apenas os índices que faltam
 *   (`createIndexes`), sem remover índices nem dados existentes.
 * - Memória (desenvolvimento e testes): sobe uma instância temporária e sincroniza os índices.
 */
export async function connectDatabase(options: ConnectOptions = {}): Promise<DatabaseMode> {
  const uri = options.uri ?? env.mongodbUri;
  const dbName = options.dbName ?? env.mongodbDbName;

  if (uri) {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
    await Promise.all(MODELS.map((model) => model.createIndexes()));
    currentMode = 'persistent';
    console.log(`[database] MongoDB persistente conectado (${describeHost()}).`);
    return currentMode;
  }

  if (env.deployed) {
    // Defesa extra: a validação do ambiente já exige MONGODB_URI quando publicado.
    throw new Error('[database] MONGODB_URI é obrigatória em ambiente publicado.');
  }
  // Import dinâmico: o pacote de testes não é carregado quando há banco persistente.
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), { dbName });
  await mongoose.syncIndexes();
  currentMode = 'memory';
  console.log('[database] MongoDB em memória iniciado.');
  return currentMode;
}

export function getDatabaseMode(): DatabaseMode | null {
  return currentMode;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  currentMode = null;
}
