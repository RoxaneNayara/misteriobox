import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const passwordService = {
  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, env.bcryptSaltRounds);
  },

  matches(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};
