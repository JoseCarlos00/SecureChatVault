// Esto nos permite añadir propiedades personalizadas al objeto Request de Express
// y que TypeScript sea consciente de ellas.

declare global {
	namespace Express {
		export interface Request {
			// Añadimos la propiedad 'user' a la interfaz Request.
			// Es opcional (?) porque no todas las peticiones la tendrán (solo las autenticadas).
			user?: { username: string; role: string };
		}
	}
}

export {}
