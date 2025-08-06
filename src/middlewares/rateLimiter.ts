import rateLimit from 'express-rate-limit';

// Límite para rutas de autenticación (más estricto)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // Limita cada IP a 10 peticiones de login/register por `windowMs`
	message: { message: 'Demasiados intentos desde esta IP, por favor intente de nuevo después de 15 minutos' },
	standardHeaders: true, // Devuelve información del límite en los headers `RateLimit-*`
	legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Límite general para el resto de la API (más flexible)
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, // Limita cada IP a 100 peticiones por `windowMs`
	message: { message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' },
	standardHeaders: true,
	legacyHeaders: false,
});
