import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SVG_ICONS } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})

export class IconRegistryService {
  
  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  registerIcons(): void {
    const path = 'assets/outline/';
    Object.values(SVG_ICONS).forEach((name) => {
      this.iconRegistry.addSvgIcon(
        name,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${path}${name}.svg`)
      );
    });
  }
}
