import { AuthPayload } from "../authPayload";

declare global {
	namespace Express {
		export interface Request {
			currentUser?: AuthPayload; // Añadimos el tipo AuthPayload al objeto Request
		}
	}
}

export {}
