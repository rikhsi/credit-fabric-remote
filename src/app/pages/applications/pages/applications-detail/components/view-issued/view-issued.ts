import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ApplicationProductInfo } from '../application-product-info/application-product-info';
import { DocsApplication, StatusApplication } from '../../../../components';
import { Card, SelectBill } from '@shared/components';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-issued',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    DocsApplication,
    ApplicationProductInfo,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
  ],
  templateUrl: './view-issued.html',
  styleUrl: './view-issued.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewIssued {
  application = input.required<OnlineApplication>();

  readonly docs = computed(() => this.application().docs ?? []);
}
