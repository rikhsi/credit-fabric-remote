import { NzSafeAny } from 'ng-zorro-antd/core/types';

export interface HandbookContext<T> {
  $implicit: T[];
}

export interface HandbookItem {
  id: number;
  name: string;
}

export interface HandbookRequest {
  url: HandbookQueryType;
  params?: Record<string, NzSafeAny>;
}

export type HandbookQueryType =
  | 'dir-oked'
  | 'sys-address-type'
  | 'dir-city'
  | 'dir-enterprise-classifier'
  | 'dir-company-activity'
  | 'dir-country'
  | 'dir-ecological-impact-code'
  | 'dir-object-new-formation'
  | 'dir-sector-economy'
  | 'dir-village';
