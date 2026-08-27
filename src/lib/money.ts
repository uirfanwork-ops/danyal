/**
 * Money is held everywhere as a whole number of minor units (cents, paisa).
 * Nothing in this application may hold an amount of money as a decimal —
 * floating point arithmetic drifts, and a fee system that drifts is worthless.
 */

export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.replace(/[\s,]/g, "").trim();
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;

  const [whole, fraction = ""] = cleaned.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minor) ? minor : null;
}

export function formatMinor(minor: number, symbol = "$"): string {
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString("en-US");
  const fraction = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}${symbol}${whole}.${fraction}`;
}

export function minorToInput(minor: number): string {
  return (minor / 100).toFixed(2);
}
