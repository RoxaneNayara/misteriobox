import { HttpErrors } from '../errors/app-error';
import type { UserRecord } from '../models/user.model';
import { userRepository } from '../repositories/user.repository';
import { passwordService } from './password.service';
import { tokenService } from './token.service';

export interface UserView {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthSession {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: UserView;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function toUserView(user: UserRecord): UserView {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function createSession(user: UserRecord): AuthSession {
  return {
    token: tokenService.sign(user._id.toString()),
    tokenType: 'Bearer',
    expiresIn: tokenService.expiresInSeconds(),
    user: toUserView(user),
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthSession> {
    if (await userRepository.existsByEmail(input.email)) {
      throw HttpErrors.conflict('EMAIL_ALREADY_REGISTERED', 'Este e-mail já está cadastrado.');
    }
    const createdUser = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: await passwordService.hash(input.password),
    });
    return createSession(createdUser);
  },

  async login(input: LoginInput): Promise<AuthSession> {
    const user = await userRepository.findByEmailWithPassword(input.email);
    const passwordIsValid =
      user !== null && (await passwordService.matches(input.password, user.passwordHash));
    if (!user || !passwordIsValid) {
      throw HttpErrors.unauthorized('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }
    return createSession(user);
  },

  async getAuthenticatedUser(userId: string): Promise<UserView> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw HttpErrors.unauthorized('UNAUTHORIZED', 'Usuário da sessão não encontrado.');
    }
    return toUserView(user);
  },
};
