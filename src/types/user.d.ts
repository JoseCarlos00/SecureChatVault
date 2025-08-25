import { Document, ObjectId } from 'mongodb';

export interface User extends Document {
	_id: ObjectId;
	username: string;
	password: string;
	name: string;
	role: 'user' | 'admin';
	comparePassword(password: string): Promise<boolean>;
}
