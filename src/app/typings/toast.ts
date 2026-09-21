export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  description: string;
}
