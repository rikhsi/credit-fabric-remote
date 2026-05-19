import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-empty',
  imports: [NzTypographyComponent],
  templateUrl: './empty.html',
  styleUrl: './empty.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Empty {
  title = input<string>();
  description = input<string>();
}
