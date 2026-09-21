import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ApplicationProductInfo } from '../application-product-info/application-product-info';
import { StatusApplication } from '../../../../components';
import { Card, SelectBill } from '@shared/components';
import { OnlineApplication } from '@api/models/los/application';
import { toReadonlyAccountItems } from '@shared/utils/account';

@Component({
  selector: 'cf-view-decline-client',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    ApplicationProductInfo,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
  ],
  templateUrl: './view-decline-client.html',
  styleUrl: './view-decline-client.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDeclineClient {
  application = input.required<OnlineApplication>();

  readonly accountItems = computed(() => toReadonlyAccountItems(this.application().accountNo));
}
