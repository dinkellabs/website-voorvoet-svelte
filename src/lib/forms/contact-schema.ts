import { z } from 'zod';

export const REQUEST_TYPES = ['Bel mij terug', 'Contact per email'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

// Use stable issue codes via `message`; the client maps these to Paraglide
// strings so NL/DE/EN visitors get the validation error in their language.
export const contactSchema = z
  .object({
    request_type: z.enum(REQUEST_TYPES),
    name: z.string().min(2, 'name_too_short').max(100, 'name_too_long'),
    last_name: z.string().min(2, 'last_name_too_short').max(100, 'last_name_too_long'),
    email: z.string().email('email_invalid'),
    phone: z
      .string()
      .regex(/^\d{10}$/, 'phone_invalid')
      .or(z.literal('')),
    description: z.string().min(1, 'description_required').max(2000, 'description_too_long'),
    turnstileToken: z.string().min(1, 'turnstile_required'),
  })
  .superRefine((data, ctx) => {
    if (data.request_type === 'Bel mij terug' && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'phone_required_for_callback',
      });
    }
  });

export type ContactFormData = z.infer<typeof contactSchema>;
