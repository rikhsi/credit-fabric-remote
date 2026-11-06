import { inject, provideAppInitializer } from '@angular/core';
import { LoanDataService } from '@core/services/loan-data.service';

export const provideLoanBranches = provideAppInitializer(() => inject(LoanDataService).loadBranches$());
