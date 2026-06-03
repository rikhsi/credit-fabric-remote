import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { FlowService } from '../services';
import { isGeneralStepValid } from '../utils/flow-step.validation';
import { ApplicationFlowRoute } from '@app/constants/route-path';

export const applicationFlowGeneralGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const flowService = inject(FlowService);
  const router = inject(Router);

  if (isGeneralStepValid(flowService.flowForm().value())) {
    return true;
  }

  const financeUrl = state.url;
  const generalUrl = financeUrl.replace(`/${ApplicationFlowRoute.Finance}`, `/${ApplicationFlowRoute.General}`);

  return router.parseUrl(generalUrl || financeUrl);
};
