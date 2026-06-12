import { DecimalPipe, LowerCasePipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Card, LabelControl } from '@shared/components';
import { PluralizePipe } from '@shared/pipes';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-card-product',
  imports: [
    NzButtonComponent,
    NgOptimizedImage,
    NzTagComponent,
    Card,
    TranslocoDirective,
    LabelControl,
    NzTypographyComponent,
    NgTemplateOutlet,
    DecimalPipe,
    PluralizePipe,
    LowerCasePipe,
    BounceDirective,
  ],
  templateUrl: './card-product.html',
  styleUrl: './card-product.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProduct {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id = input<string>();
  title = input<string>('Потоковое кредитование');
  description = input<string>('Для начинающих предпринимателей');
  image = input<string>('images/loan.png');
  annualRate = input<number>(18);
  loanAmount = input<number>(30);
  loanTerm = input<number>(3);

  apply(): void {
    void this.router.navigate(['../', 'details', this.id().toLowerCase()], { relativeTo: this.route });
  }
}
