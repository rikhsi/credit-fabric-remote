import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { CommentApplication, StatusApplication } from '../../../../components';
import { Card, LabelControlSecondary, SelectBill } from '@shared/components';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-view-approved',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    CommentApplication,
    LabelControlSecondary,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
    NzButtonComponent,
    LowerCasePipe,
    BounceDirective,
  ],
  templateUrl: './view-approved.html',
  styleUrl: './view-approved.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApproved {}
