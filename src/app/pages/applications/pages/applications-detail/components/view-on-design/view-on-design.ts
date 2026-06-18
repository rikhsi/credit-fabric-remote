import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { DocsApplication, StatusApplication } from '../../../../components';
import { Card, LabelControlSecondary, SelectBill } from '@shared/components';
import { DocumentItem } from '@api/models/los/application';

@Component({
  selector: 'cf-view-on-design',
  imports: [
    TranslocoDirective,
    Card,
    StatusApplication,
    DocsApplication,
    LabelControlSecondary,
    SelectBill,
    NzTagComponent,
    NzIconDirective,
    NzTypographyComponent,
    LowerCasePipe,
  ],
  templateUrl: './view-on-design.html',
  styleUrl: './view-on-design.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOnDesign {
  readonly docs: DocumentItem[] = [
    {
      id: 1,
      type: 'credit_agreement',
      createdDate: '2026-01-15',
      signedDate: '2026-01-25',
      isSigned: false,
    },
    {
      id: 2,
      type: 'desicion_protocol',
      createdDate: '2026-01-15',
      signedDate: '2026-01-25',
      isSigned: false,
    },
  ];
}
