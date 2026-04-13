import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Card, LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-contact-info',
  imports: [Card, LabelControlSecondary, TranslocoDirective],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {}
