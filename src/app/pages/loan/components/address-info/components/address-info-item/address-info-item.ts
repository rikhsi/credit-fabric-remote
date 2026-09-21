import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-address-info-item',
  imports: [Card, NzTypographyComponent, HandbookDirective, HandbookPipe],
  templateUrl: './address-info-item.html',
  styleUrl: './address-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfoItem {
  readonly item = input.required<OnlineStartProcessingAddress>();
}
