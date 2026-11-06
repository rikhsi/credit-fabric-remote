import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';
import { EligibilityService } from './eligibility.service';
import { LoanBranchesService } from './loan-branches.service';
import { LoanProductsService } from './loan-products.service';
import { WorkingHoursService } from './working-hours.service';

/** Loads eligibility first, then products and branches; reloads them once working hours start. */
@Injectable({ providedIn: 'root' })
export class LoanDataService {
  private readonly eligibilityService = inject(EligibilityService);
  private readonly productsService = inject(LoanProductsService);
  private readonly branchesService = inject(LoanBranchesService);
  private readonly workingHoursService = inject(WorkingHoursService);

  // Stays false while the data is reloading after opening, so the client keeps seeing the closed screen.
  public readonly isAvailable = signal<boolean>(this.workingHoursService.isOpen());

  constructor() {
    toObservable(this.workingHoursService.isOpen)
      .pipe(
        switchMap((isOpen) => {
          if (!isOpen) {
            return of(false);
          }

          if (this.isAvailable()) {
            return of(true);
          }

          return this.reload$().pipe(map(() => true));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((isAvailable) => this.isAvailable.set(isAvailable));
  }

  public loadProducts$() {
    return this.eligibilityService.init$().pipe(
      switchMap((eligible) => {
        if (!eligible) {
          this.productsService.isLoading.set(false);

          return of([]);
        }

        return this.productsService.load$().pipe(
          tap((items) => {
            if (items == null) {
              this.eligibilityService.isEligible.set(false);
            }
          }),
        );
      }),
    );
  }

  public loadBranches$() {
    return this.eligibilityService.init$().pipe(
      switchMap((eligible) => {
        if (!eligible) {
          this.branchesService.isLoading.set(false);

          return of([]);
        }

        return this.branchesService.load$().pipe(
          tap((options) => {
            // Request failure or served codes with no handbook match → not eligible.
            if (options == null || !options.length) {
              this.eligibilityService.isEligible.set(false);
            }
          }),
        );
      }),
    );
  }

  private reload$() {
    return this.eligibilityService.refresh$().pipe(switchMap(() => forkJoin([this.loadProducts$(), this.loadBranches$()])));
  }
}
