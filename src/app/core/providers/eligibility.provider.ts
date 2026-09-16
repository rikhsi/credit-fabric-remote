import { inject, provideAppInitializer } from '@angular/core';
import { EligibilityService } from '@core/services/eligibility.service';

export const provideEligibility = provideAppInitializer(() => inject(EligibilityService).init$());
