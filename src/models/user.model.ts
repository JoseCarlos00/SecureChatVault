import { model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

import { type User } from '../types/user';
import { UserSchema } from '../schemas/user.schema';

export interface UserDocument extends Omit<User, '_id'>, Document {
	comparePassword(password: string): Promise<boolean>;
}


// Middleware (hook) para hashear la contraseña antes de guardarla
UserSchema.pre<UserDocument>('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
	return bcrypt.compare(password, this.password);
};

export const UserModel = model<UserDocument>('User', UserSchema);
