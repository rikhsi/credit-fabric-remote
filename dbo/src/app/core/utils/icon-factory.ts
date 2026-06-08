import { CUSTOM_ICONS_TYPE } from './../../shared/types/icons-type';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, EMPTY } from 'rxjs';
import { SVG_ICONS } from '../../constants/icons';

export function iconFactory(
  iconRegistry: MatIconRegistry,
  sanitizer: DomSanitizer
): () => Observable<void> {
  const path: string = 'assets/outline/';

  Object.values(SVG_ICONS).forEach((name: CUSTOM_ICONS_TYPE) => {
    iconRegistry.addSvgIcon(
      name,
      sanitizer.bypassSecurityTrustResourceUrl(`${path}${name}.svg`)
    );
  });

  return (): Observable<void> => EMPTY;
}