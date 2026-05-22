import { inject, provideAppInitializer } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';
import { EMPTY } from 'rxjs';
import { SVG_COLORFUL_ICONS } from '@app/constants/svg-colorful';
import { SVG_FILL_ICONS } from '@app/constants/svg-fill';
import { SVG_OUTLINE_ICONS } from '@app/constants/svg-outline';

export const provideIcon = provideAppInitializer(() => {
  const iconService = inject(NzIconService);

  Object.entries(SVG_FILL_ICONS).forEach(([key, value]) => {
    iconService.addIconLiteral('f:' + key, value);
  });

  Object.entries(SVG_OUTLINE_ICONS).forEach(([key, value]) => {
    iconService.addIconLiteral('o:' + key, value);
  });

  Object.entries(SVG_COLORFUL_ICONS).forEach(([key, value]) => {
    iconService.addIconLiteral('c:' + key, value);
  });

  return EMPTY;
});
