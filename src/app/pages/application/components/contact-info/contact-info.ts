import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Card, LabelControlSecondary } from '@shared/components';
import { PhoneNumberPipe } from '@shared/pipes';
import { UserItem } from '@api/models/base';

@Component({
  selector: 'cf-contact-info',
  imports: [Card, LabelControlSecondary, TranslocoDirective, PhoneNumberPipe],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {
  public user = input<UserItem>(null);
}
