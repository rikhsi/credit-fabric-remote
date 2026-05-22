import { ProductConditionItem } from '@api/models/los/product';

export function mergeProductConditions(conditions: ProductConditionItem[]): ProductConditionItem | null {
  if (!conditions?.length) return null;

  const base = conditions.find((c) => c.is_default) ?? conditions[0];

  return {
    ...base,

    min_amount: Math.min(...conditions.map((c) => c.min_amount ?? 0)),
    max_amount: Math.max(...conditions.map((c) => c.max_amount ?? 0)),

    min_term: Math.min(...conditions.map((c) => c.min_term ?? 0)),
    max_term: Math.max(...conditions.map((c) => c.max_term ?? 0)),
  };
}
