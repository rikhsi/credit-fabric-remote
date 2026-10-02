import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { pickApplicationStatus } from '@api/utils';
import { AuthService } from '@core/services/auth.service';
import { OnlineGetInfoResult } from '@api/models/los/online';

@Injectable()
export class ApplicationsService {
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly authService = inject(AuthService);

  public readonly user = computed(() => this.authService.user());

  public readonly isLoading = signal<boolean>(true);
  public readonly applicationsList = signal<OnlineGetInfoResult[]>([]);

  public getApplications$() {
    this.isLoading.set(true);

    return this.onlineApiService.getApplications$().pipe(
      tap((result) => {
        const items = Array.isArray(result) ? result : [];

        this.applicationsList.set(items.map((item) => this.normalizeListItem(item)));
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.applicationsList.set([]);
        this.isLoading.set(false);

        return of([]);
      }),
    );
  }

  private normalizeListItem(item: OnlineGetInfoResult): OnlineGetInfoResult {
    const raw = item as OnlineGetInfoResult & Record<string, unknown>;

    return {
      ...item,
      sysStatusId: pickApplicationStatus(item.sysStatusId, raw['sys_status_id'], raw['status'], raw['statusId']) ?? item.sysStatusId,
    };
  }
}
