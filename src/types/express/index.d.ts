import { AuthPayload } from "../authPayload";

declare global {
	namespace Express {
		export interface Request {
			user?: AuthPayload; // Añadimos el tipo AuthPayload al objeto Request
		}
	}
}

export {}
