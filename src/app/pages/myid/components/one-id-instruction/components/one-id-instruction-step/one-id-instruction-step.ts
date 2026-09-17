import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-one-id-instruction-step',
  imports: [NzIconDirective, NzTypographyComponent],
  templateUrl: './one-id-instruction-step.html',
  styleUrl: './one-id-instruction-step.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneIdInstructionStep {
  readonly number = input.required<number>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly done = input<boolean>(false);
}
