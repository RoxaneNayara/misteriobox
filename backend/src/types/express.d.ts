declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware de autenticação. */
      authenticatedUserId?: string;
      /** Momento do login que originou a sessão (segundos desde a época Unix). */
      sessionAuthTime?: number;
    }
  }
}

export {};
