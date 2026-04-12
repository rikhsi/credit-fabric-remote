import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'cf-steps',
  imports: [NgClass],
  templateUrl: './steps.html',
  styleUrl: './steps.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Steps {
  stepsLength = input<number>();
  currentStep = input<number>();

  steps = computed(() => Array.from({ length: this.stepsLength() }, (_, index) => index + 1));
}
