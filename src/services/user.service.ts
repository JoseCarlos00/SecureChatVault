import { UserModel } from "../models/user.model"
import type { User } from "../types/user";

export const findUserById = async (id: string): Promise<User | null>  => {
  return await UserModel.findById(id).lean().select('+password');
}
