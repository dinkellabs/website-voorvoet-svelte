import { env } from '$env/dynamic/private';
import type { ReimbursementRow, PricingRow, OrderPairPricing } from './reimbursements-types.js';

const reimbursementsFiles = import.meta.glob<ReimbursementRow[]>('./reimbursements_*.json', {
  eager: true,
  import: 'default',
});

const pricingFiles = import.meta.glob<string>('./pricing_*.csv', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const DEFAULT_REIMBURSEMENTS_FILE = 'reimbursements_2026.json';
const DEFAULT_PRICING_FILE = 'pricing_2026.csv';

function selectFile<T>(
  files: Record<string, T>,
  configured: string | undefined,
  fallback: string,
  label: string,
): T {
  const wanted = configured?.trim() || fallback;
  const key = `./${wanted}`;
  const file = files[key];
  if (!file) {
    const available = Object.keys(files)
      .map((k) => k.slice(2))
      .join(', ');
    throw new Error(`${label} data file "${wanted}" not found. Available: ${available}`);
  }
  return file;
}

const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

function parseEuroAmount(s: string): number {
  const clean = s.replace(/[€\s]/g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

export function parseCsv(csv: string): PricingRow[] {
  const lines = csv.trim().split('\n');
  const rows: PricingRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line) continue;
    const commaIdx = line.lastIndexOf(',');
    if (commaIdx === -1) continue;
    const behandeling = line.slice(0, commaIdx).trim();
    const prijsStr = line.slice(commaIdx + 1).trim();
    const prijsRaw = parseEuroAmount(prijsStr);
    rows.push({
      behandeling,
      prijs: fmt.format(prijsRaw),
      prijsRaw,
    });
  }
  return rows;
}

export function getReimbursements(): ReimbursementRow[] {
  const raw = selectFile(
    reimbursementsFiles,
    env.REIMBURSEMENTS_DATA_FILE,
    DEFAULT_REIMBURSEMENTS_FILE,
    'Reimbursements',
  );
  return raw.filter((r) => r.verzekeraar !== 'Verzekeraar');
}

export function getPricing(): PricingRow[] {
  const csv = selectFile(
    pricingFiles,
    env.PRICING_DATA_FILE,
    DEFAULT_PRICING_FILE,
    'Pricing',
  );
  return parseCsv(csv);
}

// Treatment names in the source CSV. Single source of truth so the order
// page and the pricing CSV can't drift apart silently.
const ORDER_INSOLES_PRICING_KEYS = {
  extraPair: 'Podotherapeutische zolen extra paar',
  workShoes: 'Podotherapeutische zolen extra paar voor werkschoenen',
} as const;

/**
 * Look up the two prices shown on the order_insoles page from the pricing
 * CSV so the page can't show stale figures when the yearly price list
 * rolls over.
 */
export function getOrderPairPricing(): OrderPairPricing {
  const rows = getPricing();
  const find = (name: string) => rows.find((r) => r.behandeling === name)?.prijs ?? '';
  return {
    extraPair: find(ORDER_INSOLES_PRICING_KEYS.extraPair),
    workShoes: find(ORDER_INSOLES_PRICING_KEYS.workShoes),
  };
}

export type { ReimbursementRow, PricingRow, OrderPairPricing };
