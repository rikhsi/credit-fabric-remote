import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';

@Component({
  selector: 'cf-auth-one-id',
  imports: [TranslocoDirective, NzButtonComponent],
  templateUrl: './auth-one-id.html',
  styleUrl: './auth-one-id.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthOneId {
  onSubmit(): void {}
}
