import { UrlTree } from '@angular/router';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

export interface SelectItem<T = string> {
  key: string;
  value: T;
}

export interface StepItem {
  link: string | readonly NzSafeAny[] | UrlTree;
}
