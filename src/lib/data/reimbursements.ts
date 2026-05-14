import reimbursementsRaw from './reimbursements_2026.json';
import pricingCsvRaw from './pricing_2026.csv?raw';

export interface ReimbursementRow {
  verzekeraar: string;
  pakket: string;
  vergoeding: string;
}

export interface PricingRow {
  behandeling: string;
  prijs: string;
  prijsRaw: number;
}

const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

function parseEuroAmount(s: string): number {
  const clean = s.replace(/[€\s]/g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function parseCsv(csv: string): PricingRow[] {
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
  return (reimbursementsRaw as ReimbursementRow[]).filter((r) => r.verzekeraar !== 'Verzekeraar');
}

export function getPricing(): PricingRow[] {
  return parseCsv(pricingCsvRaw);
}
