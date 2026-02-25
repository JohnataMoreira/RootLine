import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
})

export const signupSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
})

// Photo Schemas
export const uploadPhotoSchema = z.object({
    description: z.string().max(500, 'Legenda muito longa (máx 500 caracteres)').optional(),
    taken_at: z.string().optional(),
})

// Tree Schemas
export const addRelativeSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    targetMemberId: z.string().uuid('ID de membro inválido'),
    familyId: z.string().uuid('ID de família inválido'),
    relationshipType: z.enum(['parent', 'spouse', 'child']),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>
export type AddRelativeInput = z.infer<typeof addRelativeSchema>
