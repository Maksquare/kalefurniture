import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number to currency in Amharic (ብር / ETB)
 * @param {number|string} amount 
 * @param {boolean} [showSymbol=true]
 * @returns {string} e.g. "45,000 ብር"
 */
export function formatPrice(amount, showSymbol = true) {
  const num = Number(amount);
  const formatted = isNaN(num) ? "0" : num.toLocaleString();
  return showSymbol ? `${formatted} ብር` : formatted;
}

export const CURRENCY_SYMBOL = "ብር";
