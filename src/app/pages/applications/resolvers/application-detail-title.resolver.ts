import { ResolveFn } from '@angular/router';
import { RouteParam } from '@app/constants/route-param';

export const applicationDetailTitleResolver: ResolveFn<string> = (route) => {
  return route.paramMap.get(RouteParam.AppId) ?? route.params[RouteParam.AppId] ?? '';
};
