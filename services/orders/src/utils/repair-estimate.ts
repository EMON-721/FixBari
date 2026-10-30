/** Deterministic indicative BDT estimate. This is NOT an ML model or final technician quote. */
export type Complexity = "BASIC" | "MODERATE" | "COMPLEX";
export type PackageTier = "STANDARD" | "PREMIUM" | "DELUXE";
export type RepairEstimate = {method:"RULE_BASED";currency:"BDT";min:number;mid:number;max:number;requiresInspection:true;disclaimer:string};

export function calculateRepairEstimate(basePrice: number, complexity: Complexity, tier: PackageTier, district: string): RepairEstimate {
  if (!Number.isFinite(basePrice) || basePrice < 0 || basePrice > 100_000_000) throw new Error("Invalid service price");
  const complexities: Record<Complexity,number>={BASIC:1,MODERATE:1.3,COMPLEX:1.75};
  const tiers: Record<PackageTier,number>={STANDARD:1,PREMIUM:1.5,DELUXE:2};
  if (!(complexity in complexities) || !(tier in tiers)) throw new Error("Invalid estimate options");
  const areaFactor=district.trim().toLowerCase()==="dhaka"?1.1:1;
  const midpoint=basePrice*complexities[complexity]*tiers[tier]*areaFactor;
  return { method:"RULE_BASED", currency:"BDT",min:Math.round(midpoint*85/100),mid:Math.round(midpoint),max:Math.round(midpoint*115/100),requiresInspection:true,disclaimer:"Indicative range only; not AI diagnosis or a binding quotation." };
}
