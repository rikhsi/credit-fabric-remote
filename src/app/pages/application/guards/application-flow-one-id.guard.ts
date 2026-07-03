import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FlowService } from '../services';
import { isFinanceStepValid, isGeneralStepValid } from '../utils/flow-step.validation';
import { ApplicationFlowRoute, ApplicationRoute, RootRoute } from '@app/constants/route-path';

export const applicationFlowOneIdGuard: CanActivateFn = ({ params: { applicationId } }) => {
  const flowService = inject(FlowService);
  const router = inject(Router);

  if (!isGeneralStepValid(flowService.flowForm)) {
    return router.createUrlTree([RootRoute.Application, ApplicationRoute.Flow, applicationId, ApplicationFlowRoute.General]);
  }

  if (!isFinanceStepValid(flowService.flowForm)) {
    return router.createUrlTree([RootRoute.Application, ApplicationRoute.Flow, applicationId, ApplicationFlowRoute.Finance]);
  }

  return true;
};
