import { inject, provideAppInitializer } from '@angular/core';
import { LoanDraftService } from '@core/services/loan-draft.service';

export const provideLoanDraftReset = provideAppInitializer(() => inject(LoanDraftService).clear());
