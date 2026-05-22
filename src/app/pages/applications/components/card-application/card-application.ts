import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { TranslocoDirective } from '@jsverse/transloco';
import { CommentApplication } from '../comment-application/comment-application';
import { ActionApplication } from '../action-application/action-application';
import { TagApplication } from '../tag-application/tag-application';
import { StatusApplication } from '../status-application/status-application';
import { DocsApplication } from '../docs-application/docs-application';
import { Card, LabelControlSecondary } from '@shared/components';
import { ApplicationStatus } from '@api/models/los/application';

@Component({
  selector: 'cf-card-application',
  imports: [
    Card,
    LabelControlSecondary,
    NzTypographyComponent,
    StatusApplication,
    TranslocoDirective,
    LowerCasePipe,
    DecimalPipe,
    TagApplication,
    CommentApplication,
    ActionApplication,
    DocsApplication,
  ],
  templateUrl: './card-application.html',
  styleUrl: './card-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardApplication {
  id = input<number>();
  title = input<string>();
  rate = input<number>();
  term = input<number>();
  amount = input<number>();
  currency = input<string>();
  status = input<ApplicationStatus>();
  paymentType = input<string>();

  actionsDisabled = input<boolean>();

  declined = output<void>();
  approved = output<void>();
}
