import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-form-box',
  imports: [NzButtonComponent, NzTypographyComponent, NzIconDirective, TranslocoDirective, BounceDirective],
  templateUrl: './form-box.html',
  styleUrl: './form-box.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBox {
  public title = input<string>();
  public submitDisabled = input<boolean>();

  public closeClick = output<void>();
  public submitClick = output<void>();
}
