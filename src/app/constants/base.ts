import { HttpContextToken } from '@angular/common/http';

export const SHOW_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => true);
export const QUEUE_TYPE = new HttpContextToken<QueueType>(() => 'core');

export interface CoreError {
  message: string;
  status: number;
  error: string;
}

export type QueueType = 'core' | 'handbook' | 'los';
