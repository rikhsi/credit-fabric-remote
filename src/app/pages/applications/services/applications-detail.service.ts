import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineAccount } from '@api/models/los/account';
import { OnlineApplication } from '@api/models/los/application';

@Injectable()
export class ApplicationsDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isLoading = signal<boolean>(true);
  public readonly application = signal<OnlineApplication | null>(null);
  public readonly accounts = signal<OnlineAccount[]>([]);

  public getApplication$(applicationId: number) {
    this.isLoading.set(true);
    this.application.set(null);
    this.accounts.set([]);

    return forkJoin({
      application: this.onlineApiService.getApplication$(applicationId),
      accounts: this.onlineApiService.getAccounts$(applicationId).pipe(catchError(() => of<OnlineAccount[]>([]))),
    }).pipe(
      tap(({ application, accounts }) => {
        this.application.set(application);
        this.accounts.set(accounts);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }
}
