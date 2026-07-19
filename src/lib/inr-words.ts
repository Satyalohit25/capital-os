// Short human-readable Indian number rendering.
// 145000 -> "1 Lakh 45 Thousand"; 12500000 -> "1 Crore 25 Lakh"
export function inrToWords(n: number): string {
  n = Math.round(Math.abs(n || 0));
  if (n === 0) return "";
  const cr = Math.floor(n / 10000000);
  n %= 10000000;
  const lk = Math.floor(n / 100000);
  n %= 100000;
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (cr) parts.push(`${cr} Crore`);
  if (lk) parts.push(`${lk} Lakh`);
  if (th) parts.push(`${th} Thousand`);
  if (rest && !cr && !lk) parts.push(`${rest}`);
  return parts.join(" ");
}
