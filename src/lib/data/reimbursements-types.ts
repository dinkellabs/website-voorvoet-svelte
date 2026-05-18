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

export interface OrderPairPricing {
  extraPair: string;
  workShoes: string;
}
