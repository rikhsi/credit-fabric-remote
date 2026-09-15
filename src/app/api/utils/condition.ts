import { ProductConditionItem } from '@api/models/los/product';

export function mergeProductConditions(conditions: ProductConditionItem[]): ProductConditionItem | null {
  if (!conditions?.length) return null;

  const base = conditions.find((c) => c.isDefault) ?? conditions[0];

  return {
    ...base,

    minAmount: Math.min(...conditions.map((c) => c.minAmount ?? 0)),
    maxAmount: Math.max(...conditions.map((c) => c.maxAmount ?? 0)),

    minTerm: Math.min(...conditions.map((c) => c.minTerm ?? 0)),
    maxTerm: Math.max(...conditions.map((c) => c.maxAmount ?? 0)),
  };
}
