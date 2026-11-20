/**
 * Usuários demonstrativos — exclusivamente para uso local.
 *
 * Nenhuma senha fica no código: cada senha é lida da variável de ambiente
 * indicada em `passwordEnvVar` (ver `backend/.env.example`). Se a variável não
 * estiver definida, uma senha temporária é gerada a cada inicialização.
 * As senhas são convertidas em hash bcrypt antes de serem gravadas.
 */
export const DEMO_USERS = [
  { name: 'Sofia Almeida', email: 'sofia@example.com', passwordEnvVar: 'DEMO_USER_SOFIA_PASSWORD' },
  {
    name: 'Bruno Carvalho',
    email: 'bruno@example.com',
    passwordEnvVar: 'DEMO_USER_BRUNO_PASSWORD',
  },
  { name: 'Lívia Rocha', email: 'livia@example.com', passwordEnvVar: 'DEMO_USER_LIVIA_PASSWORD' },
] as const;
