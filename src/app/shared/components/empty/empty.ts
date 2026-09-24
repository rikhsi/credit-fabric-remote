import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-empty',
  imports: [NzTypographyComponent, NzIconDirective, NzButtonComponent, BounceDirective],
  templateUrl: './empty.html',
  styleUrl: './empty.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Empty {
  title = input<string>();
  description = input<string>();
  icon = input<string>('f:doc');
  actionLabel = input<string>();
  actionClick = output<void>();
}
