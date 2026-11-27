/**
 * Destino após o login: só caminhos internos do site. Recusa endereços absolutos, caminhos que
 * o navegador trataria como outro domínio (`//dominio`, `/\dominio`, `\dominio`) e valores que
 * não são texto; nesses casos o jogador vai para o catálogo.
 */
export function safeRedirectPath(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/')) return fallback;
  if (/^\/[/\\]/.test(value) || value.includes('\\')) return fallback;
  return value;
}
