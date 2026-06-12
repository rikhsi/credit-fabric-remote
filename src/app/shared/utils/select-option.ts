import { NzOptionComponent } from 'ng-zorro-antd/select';
import { SelectBottomSheetOption } from '@app/typings/select';

export function readOptionField<T>(field: T | (() => T) | undefined): T | undefined {
  if (typeof field === 'function') {
    return (field as () => T)();
  }

  return field;
}

export function mapNzOptionsToBottomSheet(options: readonly NzOptionComponent[]): SelectBottomSheetOption[] {
  return options.map((option) => {
    const value = readOptionField(option.nzValue) as string | number | boolean;
    const label = String(readOptionField(option.nzLabel) ?? value ?? '');

    return { value, label };
  });
}
