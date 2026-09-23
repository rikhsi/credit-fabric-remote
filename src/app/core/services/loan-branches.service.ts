import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { HBranchApiService } from '@api/controllers/handbooks';
import { SelectOption } from '@app/typings/select';

@Injectable({ providedIn: 'root' })
export class LoanBranchesService {
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly branchApiService = inject(HBranchApiService);

  public readonly options = signal<SelectOption[]>([]);
  public readonly isLoading = signal(true);

  public load$() {
    return forkJoin({
      handbookBranches: this.branchApiService.getAll$(),
      servedBranches: this.onlineApiService.getBranches$(),
    }).pipe(
      map(({ handbookBranches, servedBranches }) => {
        const servedCodes = new Set(servedBranches.branches.map((item) => item.filialCode));

        return handbookBranches.data
          .filter((item) => item.is_active && servedCodes.has(item.cbs_code))
          .map((item) => ({ value: item.cbs_code, label: item.name }));
      }),
      tap((options) => {
        this.options.set(options);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.options.set([]);
        this.isLoading.set(false);

        return of(null);
      }),
    );
  }
}
