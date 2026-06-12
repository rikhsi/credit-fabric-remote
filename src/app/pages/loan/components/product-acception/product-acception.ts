import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { AgreementFormModel } from '@pages/loan/models';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-product-acception',
  imports: [NzCheckboxComponent, NzButtonComponent, NzIconDirective, TranslocoDirective, FormField, BounceDirective],
  templateUrl: './product-acception.html',
  styleUrl: './product-acception.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAcception {
  public readonly form = input<FieldTree<AgreementFormModel>>();

  clicked = output<boolean>();
}
