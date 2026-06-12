import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-card',
  imports: [NzTypographyComponent, NgClass, NzIconDirective, NzButtonComponent, NgTemplateOutlet, BounceDirective],
  templateUrl: './card.html',
  styleUrl: './card.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  private router = inject(Router);

  title = input<string>();
  titleRef = input<TemplateRef<NzSafeAny>>();
  topWrap = input<boolean>(true);

  link = input<UrlTree | string | string[]>();
  showSpace = input<boolean>(false);

  navigateByLink(): void {
    const link = this.link();

    if (!link) {
      return;
    }

    if (link instanceof UrlTree) {
      void this.router.navigateByUrl(link);
      return;
    }

    if (Array.isArray(link)) {
      void this.router.navigate(link);
      return;
    }

    void this.router.navigateByUrl(link);
  }
}
