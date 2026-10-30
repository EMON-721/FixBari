import { Prisma } from "@local-services/database";

export type TierType = "standard" | "premium" | "deluxe";

export const TIER_MULTIPLIERS: Record<TierType, number> = {
  standard: 1.0,
  premium: 1.5,
  deluxe: 2.0,
};

export const TIER_NAMES: Record<TierType, string> = {
  standard: "Standard",
  premium: "Premium",
  deluxe: "Deluxe",
};

export const TIER_TO_ENUM: Record<TierType, "STANDARD" | "PREMIUM" | "DELUXE"> = {
  standard: "STANDARD",
  premium: "PREMIUM",
  deluxe: "DELUXE",
};

export function calculateTierPrice(basePrice: Prisma.Decimal | number, tier: TierType): Prisma.Decimal {
  const multiplier = TIER_MULTIPLIERS[tier];
  const base = typeof basePrice === "number" ? new Prisma.Decimal(basePrice) : basePrice;
  return base.mul(multiplier);
}

export function getTierName(tier: TierType): string {
  return TIER_NAMES[tier];
}

export function getTierMultiplier(tier: TierType): number {
  return TIER_MULTIPLIERS[tier];
}

export function isValidTier(tier: string): tier is TierType {
  return tier === "standard" || tier === "premium" || tier === "deluxe";
}
