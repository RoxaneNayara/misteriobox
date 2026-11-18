/**
 * Usuários demonstrativos — exclusivamente para uso local.
 * As senhas são convertidas em hash bcrypt antes de serem gravadas.
 */
export const DEMO_USERS = [
  { name: 'Sofia Almeida', email: 'sofia@example.com', password: 'Sofia@123' },
  { name: 'Bruno Carvalho', email: 'bruno@example.com', password: 'Bruno@123' },
  { name: 'Lívia Rocha', email: 'livia@example.com', password: 'Livia@123' },
] as const;
