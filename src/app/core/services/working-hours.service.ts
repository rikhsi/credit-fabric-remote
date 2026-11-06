import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { WORKING_HOURS } from '@app/constants/working-hours';
import { isWorkingTime } from '@shared/utils/working-hours';

@Injectable({ providedIn: 'root' })
export class WorkingHoursService {
  public readonly isOpen = signal<boolean>(isWorkingTime(new Date()));

  constructor() {
    const intervalId = setInterval(() => this.check(), WORKING_HOURS.checkIntervalMs);

    inject(DestroyRef).onDestroy(() => clearInterval(intervalId));
  }

  public check(): boolean {
    const isOpen = isWorkingTime(new Date());

    this.isOpen.set(isOpen);

    return isOpen;
  }
}
