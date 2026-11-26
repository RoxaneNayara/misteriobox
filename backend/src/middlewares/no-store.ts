import type { NextFunction, Request, Response } from 'express';

/**
 * B04 — Respostas da API contêm dados pessoais e de investigação: o navegador não
 * deve guardá-las em cache, para que nada seja reexibido pelo histórico depois
 * que a sessão termina.
 */
export function noStore(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('Cache-Control', 'no-store');
  next();
}
