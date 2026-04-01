import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-contact-info',
  imports: [Card, LabelControl],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {}
