import { type User } from "../types/type";

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export default {}
