import { SelectItem } from '@app/typings/item';

export function createSelectItemByEnum<T extends Record<string, string | number>>(enumObj: T, prefix: string): SelectItem<T[keyof T]>[] {
  return Object.entries(enumObj).map(([key, value]) => ({
    key: `enum.${prefix}.${key}`,
    value: value as T[keyof T],
  }));
}
