import { z } from 'zod';
export const loginSchema = z.object({
    username: z
        .string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(30, 'El usuario no puede tener más de 30 caracteres'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
export const registerSchema = z
    .object({
    username: z
        .string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(30, 'El usuario no puede tener más de 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    nombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede tener más de 100 caracteres'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});
