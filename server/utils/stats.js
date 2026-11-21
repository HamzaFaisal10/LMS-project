// Builds a revenue-per-month series for the last `months` months from payment docs.
export function monthlySeries(payments, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString('en-US', { month: 'short' }),
      revenue: 0,
      sales: 0,
    });
  }
  const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  for (const p of payments) {
    const d = new Date(p.createdAt);
    const i = index[`${d.getFullYear()}-${d.getMonth()}`];
    if (i !== undefined) {
      buckets[i].revenue += p.amount;
      buckets[i].sales += 1;
    }
  }
  return buckets.map(({ key: _key, ...b }) => ({
    ...b,
    revenue: Math.round(b.revenue * 100) / 100,
  }));
}

export const sum = (arr, f) => Math.round(arr.reduce((n, x) => n + (f ? f(x) : x), 0) * 100) / 100;
