import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-extra-contacts',
  imports: [NzButtonComponent, NzIconDirective, Card],
  templateUrl: './extra-contacts.html',
  styleUrl: './extra-contacts.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraContacts {
  readonly add = output<void>();
  readonly edit = output<void>();
}
