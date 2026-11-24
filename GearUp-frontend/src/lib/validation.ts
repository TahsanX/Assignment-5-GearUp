import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
});

export const gearSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  brand: z.string().optional(),
  // Number inputs hand back strings, so validate the text then coerce.
  pricePerDay: z
    .string()
    .min(1, 'Price is required')
    .refine((v) => Number(v) > 0, 'Price must be greater than 0')
    .transform(Number),
  stock: z
    .string()
    .min(1, 'Stock is required')
    .refine((v) => Number.isInteger(Number(v)), 'Stock must be a whole number')
    .refine((v) => Number(v) >= 0, 'Stock cannot be negative')
    .transform(Number),
  categoryId: z.string().min(1, 'Choose a category'),
  images: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Pick a rating').max(5),
  comment: z.string().max(1000, 'Keep your comment under 1000 characters').optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type GearFormInput = z.input<typeof gearSchema>;
export type GearFormOutput = z.output<typeof gearSchema>;
export type ReviewValues = z.infer<typeof reviewSchema>;

/** Comma/newline separated image URLs → array, dropping blanks. */
export function parseImageList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
