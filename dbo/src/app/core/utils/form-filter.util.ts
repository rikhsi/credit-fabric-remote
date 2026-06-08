import { FormGroup } from '@angular/forms';


export function removeFormFilter<T extends FormGroup>(form: T, key: keyof T['controls'] | "recipient"): void {
  const control = form.get(key as string);
  if (control) {
    const isSearchText = key === 'searchText';
    control.reset(isSearchText ? '' : null);
  }
}


export function clearAllFormFilters<T extends FormGroup>(form: T): void {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (control) {
      const isSearchText = key === 'searchText';
      control.reset(isSearchText ? '' : null);
    }
  });
}


export function hasAnyFormFilter<T extends FormGroup>(form: T): boolean {
  const value = form.value as Record<string, any>;
  return Object.keys(value).some(key => {
    const val = value[key];
    if (key === 'searchText' && !val) {
      return false;
    }
    return val !== null && val !== undefined && val !== '';
  });
}


export function getSelectedItem<T extends Record<string, any>>(formValue: Record<string, any>, key: string, list: T[], matchField: keyof T): T | null {
  const selectedValue = formValue?.[key];
  if (selectedValue == null) return null;
  return list.find(item => item[matchField] === selectedValue) ?? null;
}

export function getSelectedData<T extends Record<string, any>>(value: any, list: T[], matchField: keyof T): T | null {
  if (value == null) return null;
  return list.find(item => item[matchField] === value) ?? null;
}


