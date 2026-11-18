import { isValidObjectId } from 'mongoose';
import { UserModel, type UserRecord } from '../models/user.model';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export const userRepository = {
  async create(data: CreateUserData): Promise<UserRecord> {
    const createdUser = await UserModel.create(data);
    return createdUser.toObject();
  },

  async existsByEmail(email: string): Promise<boolean> {
    const existingUser = await UserModel.exists({ email });
    return existingUser !== null;
  },

  /** Inclui o hash da senha, que por padrão não é selecionado. */
  async findByEmailWithPassword(email: string): Promise<UserRecord | null> {
    return UserModel.findOne({ email }).select('+passwordHash').lean<UserRecord>();
  },

  async findById(userId: string): Promise<UserRecord | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }
    return UserModel.findById(userId).lean<UserRecord>();
  },

  async count(): Promise<number> {
    return UserModel.countDocuments();
  },
};
