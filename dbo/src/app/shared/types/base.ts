import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export type FormValue<F> = {
  [K in keyof F]: F[K] extends AbstractControl<any, any>
  ? F[K]['value']
  : never;
};

export type FormBase<F> = { [K in keyof F]: AbstractControl };

export type FunctionType<T = string | number | boolean> = (value?: T) => void;

export type ControlType = AbstractControl | FormGroup | FormArray;

export type SelectOption<T = number> = {
  label: string;
  value: T;
  hasIcon?: boolean;
  isMatIcon?: boolean;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
};

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

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