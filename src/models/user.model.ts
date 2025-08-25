import { model } from 'mongoose';
import bcrypt from 'bcryptjs';

import { type User } from '../types/user';
import { UserSchema } from '../schemas/user.schema';

// Middleware (hook) para hashear la contraseña antes de guardarla
UserSchema.pre<User>('save', async function (next) {
	if (!this.isModified('password')) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

export const UserModel = model<User>('User', UserSchema);
