import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { AuthService } from '@core/services';
import { OnlineGetInfoResult } from '@api/models/los';

@Injectable()
export class ApplicationsService {
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly authService = inject(AuthService);

  public readonly user = computed(() => this.authService.user());

  public readonly isLoading = signal<boolean>(true);
  public readonly applicationsList = signal<OnlineGetInfoResult[]>([]);

  public getApplications$() {
    this.isLoading.set(true);

    return this.onlineApiService.getApplications$(this.user().pinfl).pipe(
      tap((result) => {
        this.applicationsList.set(result);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }
}
