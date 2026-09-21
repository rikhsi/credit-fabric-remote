import { Injectable, signal } from '@angular/core';
import { ToastItem, ToastType } from '@app/typings/toast';

const DEFAULT_DURATION_MS = 4500;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly items = signal<ToastItem[]>([]);

  success(title: string, description = ''): number {
    return this.show('success', title, description);
  }

  error(title: string, description = ''): number {
    return this.show('error', title, description);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    for (const id of this.timers.keys()) {
      this.clearTimer(id);
    }

    this.items.set([]);
  }

  private show(type: ToastType, title: string, description: string, duration = DEFAULT_DURATION_MS): number {
    const id = this.nextId++;

    this.items.update((items) => [...items, { id, type, title, description }]);

    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }

    return id;
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
