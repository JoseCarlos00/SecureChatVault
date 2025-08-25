import { type AuthPayload } from '../authPayload';

// Extiende la interfaz Request de Express para incluir la propiedad currentUser
declare global {
	namespace Express {
		interface Request {
			currentUser?: AuthPayload;
		}
	}
}
