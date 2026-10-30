import type { ServiceTier } from "@/types/booking";

export const SERVICE_TIERS: ServiceTier[] = [
  { id: "standard", name: "Standard", multiplier: 1.0 },
  { id: "premium", name: "Premium", multiplier: 1.5 },
  { id: "deluxe", name: "Deluxe", multiplier: 2.0 },
];

export function getTierMultiplier(tierId: string): number {
  const tier = SERVICE_TIERS.find((t) => t.id === tierId);
  return tier?.multiplier || 1.0;
}
