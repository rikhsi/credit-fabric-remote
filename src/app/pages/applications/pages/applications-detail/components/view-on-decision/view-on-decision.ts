import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ApplicationProductInfo } from '../application-product-info/application-product-info';
import { CommentApplication, StatusApplication } from '../../../../components';
import { Card, SelectBill } from '@shared/components';
import { OnlineAccount } from '@api/models/los/account';
import { OnlineApplication } from '@api/models/los/application';
import { BounceDirective } from '@shared/directives';
import { matchSelectedAccount } from '@shared/utils/account';

@Component({
  selector: 'cf-view-on-decision',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    CommentApplication,
    ApplicationProductInfo,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
    NzButtonComponent,
    BounceDirective,
  ],
  templateUrl: './view-on-decision.html',
  styleUrl: './view-on-decision.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOnDecision {
  application = input.required<OnlineApplication>();
  accounts = input<OnlineAccount[]>([]);

  readonly accountItems = computed(() => matchSelectedAccount(this.accounts(), this.application().accountNo));
}
