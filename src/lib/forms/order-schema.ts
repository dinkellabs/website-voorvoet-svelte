import { z } from 'zod';

export const INSOLE_TYPES = ['Dagelijkse zolen', 'Sportzolen', 'Zolen voor werkschoenen'] as const;
export type InsoleType = (typeof INSOLE_TYPES)[number];

// Accept what users actually type in NL/DE/EN: 1-1-1985, 01/01/1985, 01.01.1985.
// Normalize to canonical DD-MM-YYYY so the order email always renders one format
// regardless of which separator or zero-padding the visitor chose.
const DATE_INPUT_REGEX = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
const CANONICAL_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

export const orderSchema = z.object({
  first_name: z.string().min(1, 'first_name_required').max(50, 'first_name_too_long'),
  last_name: z.string().min(1, 'last_name_required').max(50, 'last_name_too_long'),
  email: z.string().email('email_invalid'),
  birth_date: z
    .string()
    .transform((value) => {
      const match = value.trim().match(DATE_INPUT_REGEX);
      if (!match) return value;
      const day = match[1]!;
      const month = match[2]!;
      const year = match[3]!;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    })
    .pipe(z.string().regex(CANONICAL_DATE_REGEX, 'birth_date_invalid')),
  insole_type: z.enum(INSOLE_TYPES).default('Dagelijkse zolen'),
  quantity: z.coerce.number().int().min(1, 'quantity_invalid').max(3, 'quantity_invalid').default(1),
  notes: z.string().max(1000, 'notes_too_long').optional().default(''),
  capToken: z.string().min(1, 'cap_required'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
