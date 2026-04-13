import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { StatusApplication } from '../status-application/status-application';
import { Card, LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-card-application',
  imports: [Card, NzTagComponent, LabelControlSecondary, NzTypographyComponent, StatusApplication],
  templateUrl: './card-application.html',
  styleUrl: './card-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardApplication {}
