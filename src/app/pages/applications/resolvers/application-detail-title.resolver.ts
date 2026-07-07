import { ResolveFn } from '@angular/router';
import { translate } from '@jsverse/transloco';
import { RouteParam } from '@app/constants/route-param';

export const applicationDetailTitleResolver: ResolveFn<string> = (route) => {
  const id = route.paramMap.get(RouteParam.AppId) ?? '';
  return translate('application.number', { id });
};
