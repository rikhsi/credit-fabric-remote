import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StepItem } from '@typings';

@Component({
  selector: 'cf-step',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './step.html',
  styleUrl: './step.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step {
  readonly steps = input.required<readonly StepItem[]>();
}
