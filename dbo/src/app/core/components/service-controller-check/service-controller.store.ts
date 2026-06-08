import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServiceControllerStore {

  services = signal<string[]>([]);
  errorMessage = signal<string | null>(null);
  iconContent = signal(false);

  setServices(list: string[]) {
    this.services.set(list);
  }

  clear() {
    this.errorMessage.set(null);
  }
}
