import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { OnlineApplicationProduct } from '@api/models/los/application';
import { LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-application-product-info',
  imports: [TranslocoDirective, LabelControlSecondary, NzTypographyComponent, DecimalPipe, LowerCasePipe],
  templateUrl: './application-product-info.html',
  styleUrl: './application-product-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationProductInfo {
  product = input.required<OnlineApplicationProduct>();
}
