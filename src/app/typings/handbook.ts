import { NzSafeAny } from 'ng-zorro-antd/core/types';

export interface HandbookContext<T> {
  $implicit: T[];
}

export interface HandbookItem {
  id: number | string;
  name: string;
}

/** Handbook catalog keys — mapped to API services in HandbookApiService. */
export type HandbookType = 'dir-city' | 'dir-company-activity' | 'dir-village' | 'dir-branch' | 'sys-address-type';

export interface HandbookRequest {
  type: HandbookType;
  params?: Record<string, NzSafeAny>;
}
