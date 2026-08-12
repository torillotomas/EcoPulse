import { z } from "zod";

export const emailSchema = z.string().email("El formato del email no es válido");

export const baseAuthSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});

export const loginSchema = baseAuthSchema.extend({
  recordarme: z.boolean().default(false),
});

export const registerSchema = baseAuthSchema
  .extend({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    confirmarContraseña: z.string(),
  })
  .refine((data) => data.password === data.confirmarContraseña, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContraseña"],
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
