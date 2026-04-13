import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'cf-product-acception',
  imports: [NzCheckboxComponent, NzButtonComponent, NzIconDirective, TranslocoDirective],
  templateUrl: './product-acception.html',
  styleUrl: './product-acception.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAcception {
  clicked = output<boolean>();
}
