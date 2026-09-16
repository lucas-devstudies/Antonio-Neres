import {z} from "zod";

//Para validar se os valores passados no Login estão certos
export const loginSchema = z.object({
    email: z
    .string()
    .email("Por favor, insira um email válido")
    .min(10,"Por favor, insira um email válido")
    .max(50,"Por favor, insira um email válido"),

    password: z
    .string()
    .min(6,"A senha deve ter no mínimo 6 caracteres")
    .max(20,"A senha deve ter no máximo 20 caracteres"),
})