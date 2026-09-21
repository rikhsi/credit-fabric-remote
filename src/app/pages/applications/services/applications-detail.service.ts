import { inject, Injectable, signal } from '@angular/core';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineApplication } from '@api/models/los/application';

@Injectable()
export class ApplicationsDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isLoading = signal<boolean>(true);
  public readonly application = signal<OnlineApplication | null>(null);

  public getApplication$(applicationId: number) {
    this.isLoading.set(true);
    this.application.set(null);

    return this.onlineApiService.getApplication$(applicationId).pipe(
      tap((application) => {
        this.application.set(application);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }

  public claimLoan$(applicationId: number, accountNo: string, isAccepted: boolean) {
    return this.onlineApiService.claimLoan$({ applicationId, accountNo, isAccepted }).pipe(
      switchMap(() => {
        return this.getApplication$(applicationId);
      }),
    );
  }
}
