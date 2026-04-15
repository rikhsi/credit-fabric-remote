import { HttpContextToken } from '@angular/common/http';

export const SHOW_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => true);
export const QUEUE_TYPE = new HttpContextToken<QueueType>(() => 'los');
export const USE_HTTP_CACHE = new HttpContextToken<boolean>(() => false);

export interface CoreError {
  message: string;
  status: number;
  error: string;
}

export type QueueType = 'core' | 'handbook' | 'los';
