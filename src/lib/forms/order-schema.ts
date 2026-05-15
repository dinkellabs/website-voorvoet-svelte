import { z } from 'zod';

export const INSOLE_TYPES = ['Dagelijkse zolen', 'Sportzolen', 'Zolen voor werkschoenen'] as const;
export type InsoleType = (typeof INSOLE_TYPES)[number];

const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

export const orderSchema = z.object({
  first_name: z.string().min(1, 'first_name_required').max(50, 'first_name_too_long'),
  last_name: z.string().min(1, 'last_name_required').max(50, 'last_name_too_long'),
  email: z.string().email('email_invalid'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'phone_invalid')
    .or(z.literal('')),
  birth_date: z.string().regex(DATE_REGEX, 'birth_date_invalid'),
  insole_type: z.enum(INSOLE_TYPES),
  quantity: z.coerce.number().int().min(1, 'quantity_invalid').max(3, 'quantity_invalid'),
  notes: z.string().max(1000, 'notes_too_long').optional().default(''),
  capToken: z.string().min(1, 'cap_required'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
