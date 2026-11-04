import type { ScholarshipPricingSummary } from '../types/scholarship';

/**
 * Extrae el valor numérico de un string de precio (ej. "$12,000 MXN" -> 12000).
 * Retorna null si el texto no contiene cifras (ej. "Consultar", "Gratis", etc.).
 */
export function parsePriceAmount(priceDisplay: string | null | undefined): number | null {
  if (!priceDisplay) return null;
  const cleaned = priceDisplay.replace(/,/g, '').trim();
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return Number.isFinite(num) && num > 0 ? num : null;
}

/**
 * Formatea un número como moneda en pesos mexicanos (ej. 6000 -> "$6,000 MXN").
 */
export function formatCurrencyMx(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `$${formatted} MXN`;
}

/**
 * Calcula el desglose detallado de un descuento o beca sobre el precio del curso.
 */
export function calculateScholarshipPricing(
  priceDisplay: string | null | undefined,
  discountPercent: number
): ScholarshipPricingSummary {
  const clampedDiscount = Math.max(1, Math.min(100, Math.round(discountPercent)));
  const originalAmount = parsePriceAmount(priceDisplay);

  if (originalAmount === null) {
    const isFree = clampedDiscount === 100;
    return {
      originalAmount: null,
      discountPercent: clampedDiscount,
      discountAmount: null,
      finalAmount: null,
      formattedOriginal: priceDisplay?.trim() || 'Arancel ordinario',
      formattedDiscount: `${clampedDiscount}% de beca`,
      formattedFinal: isFree ? 'Exención total (Beca 100%)' : `Beca del ${clampedDiscount}% aplicada`,
      isFree,
      hasNumericPrice: false,
    };
  }

  const discountAmount = clampedDiscount === 100
    ? originalAmount
    : Math.round((originalAmount * clampedDiscount) / 100);

  const finalAmount = Math.max(0, originalAmount - discountAmount);
  const isFree = clampedDiscount === 100 || finalAmount === 0;

  return {
    originalAmount,
    discountPercent: clampedDiscount,
    discountAmount,
    finalAmount,
    formattedOriginal: formatCurrencyMx(originalAmount),
    formattedDiscount: isFree ? '100% de beca (Exención)' : `-${formatCurrencyMx(discountAmount)} (${clampedDiscount}%)`,
    formattedFinal: isFree ? '$0 MXN (Beca 100%)' : formatCurrencyMx(finalAmount),
    isFree,
    hasNumericPrice: true,
  };
}

