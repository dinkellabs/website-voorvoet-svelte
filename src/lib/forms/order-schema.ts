import { z } from 'zod';

export const INSOLE_TYPES = ['Dagelijkse zolen', 'Sportzolen', 'Zolen voor werkschoenen'] as const;
export type InsoleType = (typeof INSOLE_TYPES)[number];

// Accept what users actually type in NL/DE/EN: 1-1-1985, 01/01/1985, 01.01.1985.
// Normalize to canonical DD-MM-YYYY so the order email always renders one format
// regardless of which separator or zero-padding the visitor chose.
const DATE_INPUT_REGEX = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
const CANONICAL_DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

// Tooltip says "age between 4 and 120 years". Make that the actual rule —
// otherwise a typo like 45/05/1982 (month 5, day 45) sails past a format
// check that only counts digits.
const MIN_AGE_YEARS = 4;
const MAX_AGE_YEARS = 120;

function parseCanonical(value: string): { day: number; month: number; year: number } | null {
  const match = value.match(CANONICAL_DATE_REGEX);
  if (!match) return null;
  const [d, m, y] = value.split('-');
  return { day: Number(d), month: Number(m), year: Number(y) };
}

function isRealCalendarDate(value: string): boolean {
  const parts = parseCanonical(value);
  if (!parts) return false;
  const { day, month, year } = parts;
  // `new Date(y, m-1, d)` silently rolls invalid components forward
  // (Feb 30 → Mar 2). Round-trip the components to catch that.
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}

function isWithinAgeRange(value: string): boolean {
  const parts = parseCanonical(value);
  if (!parts) return false;
  const { day, month, year } = parts;
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  const min = new Date(now.getFullYear() - MAX_AGE_YEARS, now.getMonth(), now.getDate());
  const max = new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate());
  return birth >= min && birth <= max;
}

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
    .pipe(
      z
        .string()
        .regex(CANONICAL_DATE_REGEX, 'birth_date_invalid')
        .refine(isRealCalendarDate, 'birth_date_unreal')
        .refine(isWithinAgeRange, 'birth_date_out_of_range'),
    ),
  insole_type: z.enum(INSOLE_TYPES).default('Dagelijkse zolen'),
  quantity: z.coerce.number().int().min(1, 'quantity_invalid').max(3, 'quantity_invalid').default(1),
  notes: z.string().max(1000, 'notes_too_long').optional().default(''),
  capToken: z.string().min(1, 'cap_required'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
