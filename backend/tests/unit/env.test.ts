import { describe, expect, it, vi } from 'vitest';
import { isDeployedEnvironment, loadEnv } from '../../src/config/env';

const STRONG_SECRET = 'a'.repeat(64);
const ATLAS_URI = 'mongodb+srv://usuario-exemplo:senha-exemplo@cluster-exemplo.mongodb.net';

describe('Configuração por ambiente', () => {
  it('local: banco em memória, usuários demonstrativos ligados e segredo temporário com aviso', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const config = loadEnv({});
    expect(config).toMatchObject({ deployed: false, mongodbUri: undefined, seedDemoUsers: true });
    expect(config.jwtSecret).toHaveLength(64);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('local: SEED_DEMO_USERS=false desliga os usuários demonstrativos', () => {
    expect(loadEnv({ JWT_SECRET: STRONG_SECRET, SEED_DEMO_USERS: 'false' }).seedDemoUsers).toBe(
      false,
    );
  });

  it('reconhece produção e qualquer implantação na Vercel (inclusive prévias)', () => {
    expect(isDeployedEnvironment({ NODE_ENV: 'production' })).toBe(true);
    expect(isDeployedEnvironment({ VERCEL: '1', NODE_ENV: 'development' })).toBe(true);
    expect(isDeployedEnvironment({ NODE_ENV: 'test' })).toBe(false);
  });

  it('produção exige MONGODB_URI e JWT_SECRET, sem exibir valores', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(
      /MONGODB_URI é obrigatória[\s\S]*JWT_SECRET é obrigatória/,
    );
  });

  it('produção recusa JWT_SECRET curto e URI fora do formato MongoDB', () => {
    let message = '';
    try {
      loadEnv({ VERCEL: '1', JWT_SECRET: 'curto-demais', MONGODB_URI: 'postgres://x' });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/JWT_SECRET deve ter pelo menos 32/);
    expect(message).toMatch(/mongodb:\/\/ ou mongodb\+srv:\/\//);
    // Os valores informados nunca aparecem na mensagem.
    expect(message).not.toContain('curto-demais');
    expect(message).not.toContain('postgres://x');
  });

  it('produção nunca cria usuários demonstrativos e recusa SEED_DEMO_USERS=true', () => {
    const base = { NODE_ENV: 'production', JWT_SECRET: STRONG_SECRET, MONGODB_URI: ATLAS_URI };
    expect(loadEnv(base)).toMatchObject({ deployed: true, seedDemoUsers: false });
    expect(() => loadEnv({ ...base, SEED_DEMO_USERS: 'true' })).toThrow(/SEED_DEMO_USERS/);
  });

  it('aceita várias origens de CORS separadas por vírgula', () => {
    expect(
      loadEnv({ JWT_SECRET: STRONG_SECRET, CORS_ORIGIN: 'https://a.example, https://b.example' })
        .corsOrigins,
    ).toEqual(['https://a.example', 'https://b.example']);
  });

  describe('isolamento entre Preview e Production na Vercel', () => {
    const vercel = (vercelEnv: string, dbName?: string) => ({
      VERCEL: '1',
      VERCEL_ENV: vercelEnv,
      JWT_SECRET: STRONG_SECRET,
      MONGODB_URI: ATLAS_URI,
      ...(dbName ? { MONGODB_DB_NAME: dbName } : {}),
    });

    it('exige MONGODB_DB_NAME explícita na Vercel', () => {
      expect(() => loadEnv(vercel('production'))).toThrow(/MONGODB_DB_NAME é obrigatória/);
      expect(() => loadEnv(vercel('preview'))).toThrow(/MONGODB_DB_NAME é obrigatória/);
    });

    it('Preview só aceita banco de prévia', () => {
      expect(() => loadEnv(vercel('preview', 'misteriobox'))).toThrow(/banco de prévia/);
      expect(loadEnv(vercel('preview', 'misteriobox-preview')).mongodbDbName).toBe(
        'misteriobox-preview',
      );
    });

    it('Production recusa banco de prévia', () => {
      expect(() => loadEnv(vercel('production', 'misteriobox-preview'))).toThrow(
        /não pode apontar para um banco de prévia/,
      );
      expect(loadEnv(vercel('production', 'misteriobox')).mongodbDbName).toBe('misteriobox');
    });
  });
});
