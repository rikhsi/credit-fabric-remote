import { NzSafeAny } from 'ng-zorro-antd/core/types';

export interface HandbookContext<T> {
  $implicit: T[];
}

export interface HandbookItem {
  id: number | string;
  name: string;
}

export interface HandbookRequest {
  url: HandbookQueryType;
  params?: Record<string, NzSafeAny>;
}

export type HandbookQueryType =
  | 'dir-city'
  | 'dir-company-activity'
  | 'dir-village'
  | 'dir-branch';
