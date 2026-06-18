import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { StatusApplication } from '../../../../components';
import { Card, LabelControlSecondary, SelectBill } from '@shared/components';

@Component({
  selector: 'cf-view-decline-client',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    LabelControlSecondary,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
    LowerCasePipe,
  ],
  templateUrl: './view-decline-client.html',
  styleUrl: './view-decline-client.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDeclineClient {}
