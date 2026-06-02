import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { FlowExtraInformationForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-extra-info-item',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, HandbookDirective, HandbookPipe],
  templateUrl: './extra-info-item.html',
  styleUrl: './extra-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfoItem {
  readonly item = input.required<FlowExtraInformationForm>();

  readonly edit = output<void>();
}
