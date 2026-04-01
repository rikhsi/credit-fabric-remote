import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-required-buttons',
  imports: [Card, NzButtonComponent, NzIconDirective, TranslocoDirective],
  templateUrl: './required-buttons.html',
  styleUrl: './required-buttons.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequiredButtons {
  showExtraContacts = signal<boolean>(true);
  showExtraInfo = signal<boolean>(true);

  extraContactClick = output<void>();
  extraInfoClick = output<void>();
}
