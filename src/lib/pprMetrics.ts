import type { AmmoPurchase } from '@/types';

export interface PPRMetrics {
  currentPPR: number;      // Most recent purchase
  averagePPR: number;      // Weighted average across all purchases
  lowestPPR: number;       // Best deal ever
  highestPPR: number;      // Most expensive
  totalSpent: number;      // Lifetime spending on this ammo type
  totalPurchased: number;  // Total rounds ever purchased
  bestSeller: string | null;  // Seller with lowest PPR
  priceHistory: Array<{
    date: string;
    ppr: number;
    quantity: number;
    seller: string | null;
  }>;
}

/**
 * Calculate price-per-round metrics from purchase history
 */
export function calculatePPRMetrics(purchases: AmmoPurchase[]): PPRMetrics | null {
  if (purchases.length === 0) return null;

  // Sort by date descending (most recent first)
  const sorted = [...purchases].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

  const pprs = sorted.map((p) => ({
    ppr: p.priceTotal / p.quantity,
    quantity: p.quantity,
    date: p.purchaseDate,
    seller: p.seller,
  }));

  const totalSpent = purchases.reduce((sum, p) => sum + p.priceTotal, 0);
  const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0);

  // Find the seller with the lowest PPR
  let bestSeller: string | null = null;
  let lowestPPR = Infinity;
  for (const p of pprs) {
    if (p.ppr < lowestPPR) {
      lowestPPR = p.ppr;
      bestSeller = p.seller;
    }
  }

  return {
    currentPPR: pprs[0].ppr,
    averagePPR: totalSpent / totalPurchased,
    lowestPPR,
    highestPPR: Math.max(...pprs.map((p) => p.ppr)),
    totalSpent,
    totalPurchased,
    bestSeller,
    priceHistory: pprs,
  };
}

/**
 * Format price-per-round for display
 */
export function formatPPR(ppr: number): string {
  // Use 3 decimal places for precision (e.g., $0.285)
  return `$${ppr.toFixed(3)}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Determine PPR trend compared to average
 * Returns 'up' if current is >5% above average (bad - paying more)
 * Returns 'down' if current is >5% below average (good - paying less)
 * Returns 'stable' if within 5% of average
 */
export function getPPRTrend(current: number, average: number): 'up' | 'down' | 'stable' {
  if (average === 0) return 'stable';
  const diff = ((current - average) / average) * 100;
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

/**
 * Get color class for PPR trend
 * 'up' is bad (paying more) - red
 * 'down' is good (paying less) - green
 * 'stable' is neutral - muted
 */
export function getPPRTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-red-500';
    case 'down':
      return 'text-green-500';
    case 'stable':
      return 'text-muted-foreground';
  }
}
