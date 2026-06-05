import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { FlowService } from '../services';
import { isGeneralStepValid } from '../utils/flow-step.validation';
import { ApplicationFlowRoute, ApplicationRoute, RootRoute } from '@app/constants/route-path';

export const applicationFlowFinanceGuard: CanActivateFn = ({ params: { applicationId } }, state: RouterStateSnapshot) => {
  const flowService = inject(FlowService);
  const router = inject(Router);

  if (isGeneralStepValid(flowService.flowForm)) {
    return true;
  }

  return router.createUrlTree([RootRoute.Application, ApplicationRoute.Flow, applicationId, ApplicationFlowRoute.General]);
};
