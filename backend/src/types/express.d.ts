declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware de autenticação. */
      authenticatedUserId?: string;
    }
  }
}

export {};
