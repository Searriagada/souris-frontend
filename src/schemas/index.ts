import { z } from 'zod';

// Auth schemas
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
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Debe contener mayúscula, minúscula y número'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Insumo schemas
export const insumoSchema = z.object({
  nombre_insumo: z
    .string({ required_error: 'El nombre del insumo es requerido' })
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  id_categoria: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser un número positivo')
    .optional(),
  precio_insumo: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .optional(),
  link_insumo: z
    .string()
    .optional(),
});


// Producto schemas
export const productoSchema = z.object({
  sku: z
    .string()
    .min(1, 'El SKU es requerido')
    .max(20, 'El SKU no puede tener más de 20 caracteres'),
  nombre_producto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  descripcion: z
    .string()
    .max(300, 'La descripción no puede tener más de 300 caracteres')
    .optional()
    .or(z.literal('')),
  id_tipo_producto: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser un número positivo')
    .optional(),
  utilidad: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'La utilidad no puede ser negativa'),
  cantidad: z
    .number({ invalid_type_error: 'Debe ser un número' })
  /*costo: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  precio_venta: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  cadena: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  caja: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  despacho: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  premiun: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  neto: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  iva: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  total: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  valor_caja: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El valor no puede ser negativo')
    .optional(),
  valor_cadena: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El valor no puede ser negativo')
    .optional(),
  joya: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El valor no puede ser negativo'),
  utilidad: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El valor no puede ser negativo'),*/
});

// Caja schemas
export const cajaSchema = z.object({
  nombre_caja: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  precio: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
});

// Cadena schemas
export const cadenaSchema = z.object({
  nombre_cadena: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
});

// Plataforma schemas
export const plataformaSchema = z.object({
  nombre_plataforma: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  comision: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'La comisión no puede ser negativa')
    .max(100, 'La comisión no puede ser mayor a 100%'),
});

// Cliente schemas
export const clienteSchema = z.object({
  nombre_cliente: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

// Venta schemas
export const ventaSchema = z.object({
  id_plataforma: z
    .number({ invalid_type_error: 'Seleccione una plataforma' })
    .min(1, 'Seleccione una plataforma'),
  id_cliente: z
    .number({ invalid_type_error: 'Seleccione un cliente' })
    .min(1, 'Seleccione un cliente'),
  costo_despacho: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El costo no puede ser negativo'),
  fecha_venta: z.string().min(1, 'La fecha es requerida'),
});

// Stock schema
export const stockSchema = z.object({
  cantidad: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type InsumoFormData = z.infer<typeof insumoSchema>;
export type ProductoFormData = z.infer<typeof productoSchema>;
export type CajaFormData = z.infer<typeof cajaSchema>;
export type CadenaFormData = z.infer<typeof cadenaSchema>;
export type PlataformaFormData = z.infer<typeof plataformaSchema>;
export type ClienteFormData = z.infer<typeof clienteSchema>;
export type VentaFormData = z.infer<typeof ventaSchema>;
export type StockFormData = z.infer<typeof stockSchema>;

