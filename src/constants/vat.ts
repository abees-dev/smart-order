/**
 * VAT (Value Added Tax) rate constants used throughout the application
 */

export const VAT_RATES = [0, 5, 8, 10] as const;

export type VatRate = (typeof VAT_RATES)[number];

export const VAT_RATE_OPTIONS = VAT_RATES.map((rate) => ({
  value: rate.toString(),
  label: `${rate}%`,
}));

/**
 * Default VAT rate for new items
 */
export const DEFAULT_VAT_RATE: VatRate = 0;

/**
 * Check if a given number is a valid VAT rate
 */
export const isValidVatRate = (rate: number): rate is VatRate => {
  return VAT_RATES.includes(rate as VatRate);
};
