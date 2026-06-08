import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(equal?: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date = control.value;
    if (!date) return { required: true };

    const { start, end } = date;

    if (!start || !end) {
      return { required: true };
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (equal) {
      if (startDate > endDate) {
        return { dateOrder: true };
      }
    } else {
      if (startDate >= endDate) {
        return { dateOrder: true };
      }
    }

    return null;
  };
}
