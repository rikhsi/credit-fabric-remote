import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export enum VALIDATION_ERROR {
  required = 'required',
  minlength = 'minlength',
  maxlength = 'maxlength',
  empty = 'empty',
  server = 'server',
  UserNotActive = 'UserNotActive',
  UserNotFound = 'UserNotFound',
  token = 'tokenExpired',
  email = 'email',
  pattern = 'pattern',
  min = 'min',
  max = 'max',
}

export type ValidationErrorType = {
  [key in VALIDATION_ERROR]: (control?: AbstractControl) => string;
};

export type ControlType = AbstractControl | FormGroup | FormArray;

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private validationMessages: Partial<ValidationErrorType> = {
    [VALIDATION_ERROR.required]: () => 'Это поле обязательно для заполнения',
    [VALIDATION_ERROR.email]: () => 'Введите корректный email адрес',
    [VALIDATION_ERROR.empty]: () => ' ',
    [VALIDATION_ERROR.server]: () => 'Ошибка сервера',
    [VALIDATION_ERROR.UserNotFound]: () => 'Пользователь не найден',
    [VALIDATION_ERROR.UserNotActive]: () => 'Пользователь не активен',
    [VALIDATION_ERROR.pattern]: () => 'Неверный формат',
    [VALIDATION_ERROR.minlength]: (control?: AbstractControl) => {
      const requiredLength = control?.getError('minlength')?.requiredLength;
      return `Минимальная длина: ${requiredLength} символов`;
    },
    [VALIDATION_ERROR.maxlength]: (control?: AbstractControl) => {
      const requiredLength = control?.getError('maxlength')?.requiredLength;
      return `Максимальная длина: ${requiredLength} символов`;
    },
    [VALIDATION_ERROR.min]: (control?: AbstractControl) => {
      const min = control?.getError('min')?.min;
      return `Минимальное значение: ${min}`;
    },
    [VALIDATION_ERROR.max]: (control?: AbstractControl) => {
      const max = control?.getError('max')?.max;
      return `Максимальное значение: ${max}`;
    },
  };

  validateField(control: AbstractControl | null | undefined): string {
    if (!control?.invalid || !control?.dirty) return '';

    const controlErrorKeys = Object.keys(control?.errors || {});

    const errorMessages = controlErrorKeys
      .map((errorKey) => {
        const validationError = VALIDATION_ERROR[errorKey as keyof typeof VALIDATION_ERROR];
        if (validationError && this.validationMessages[validationError]) {
          return this.validationMessages[validationError]!(control);
        }
        return '';
      })
      .filter((msg) => msg !== '');

    return errorMessages.join('. ');
  }

  hasError(control: AbstractControl | null | undefined): boolean {
    return !!(control?.invalid && control?.dirty);
  }

  isValid(control: AbstractControl | null | undefined): boolean {
    return !!(control?.valid && control?.dirty);
  }

  updateControlStatus(control: ControlType): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((innerControl) => {
        this.updateControlStatus(innerControl);
      });
    } else {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    }
  }

  markAllAsTouched(control: ControlType): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((innerControl) => {
        this.markAllAsTouched(innerControl);
      });
    } else {
      control.markAsTouched();
      control.markAsDirty();
    }
  }
}