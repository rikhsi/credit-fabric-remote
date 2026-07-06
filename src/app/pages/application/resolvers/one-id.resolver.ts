import { ResolveFn } from '@angular/router';
import { ApplicationFlowRoute, ApplicationRoute, RootRoute } from '@app/constants/route-path';

export const oneIdResolver: ResolveFn<{ link: string[] }> = ({ params: { applicationId } }) => {
  return { link: ['/', RootRoute.Application, ApplicationRoute.Flow, applicationId, ApplicationFlowRoute.Finance] };
};
