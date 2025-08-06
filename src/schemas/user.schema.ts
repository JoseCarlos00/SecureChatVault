import { Schema } from 'mongoose';

export const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, 'El nombre de usuario es obligatorio'],
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, 'La contraseña es obligatoria'],
			minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		name: {
			type: String,
			required: [true, 'El nombre es obligatorio'],
		},
	},
	{ timestamps: true }
);
