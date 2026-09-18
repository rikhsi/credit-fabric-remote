import { FieldTree } from '@angular/forms/signals';

type AnyFieldTree = FieldTree<unknown>;

/** `markAsDirty()` only affects the field it is called on, so child controls keep hiding their errors. */
export function markTreeAsDirty<T>(field: FieldTree<T>): void {
  field().markAsDirty();

  const value = field().value();

  if (Array.isArray(value)) {
    for (const child of field as unknown as Iterable<AnyFieldTree>) {
      markTreeAsDirty(child);
    }

    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const [, child] of field as unknown as Iterable<[string, AnyFieldTree]>) {
      markTreeAsDirty(child);
    }
  }
}
