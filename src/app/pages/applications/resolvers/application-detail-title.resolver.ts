import { ResolveFn } from '@angular/router';
import { RouteParam } from '@app/constants/route-param';

export const applicationDetailTitleResolver: ResolveFn<{ id: string }> = (route) => ({
  id: route.paramMap.get(RouteParam.AppId) ?? '',
});
