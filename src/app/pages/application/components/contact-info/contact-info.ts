import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card, LabelControlSecondary } from '@shared/components';

@Component({
  selector: 'cf-contact-info',
  imports: [Card, LabelControlSecondary],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {}
