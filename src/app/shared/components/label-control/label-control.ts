import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cf-label-control',
  imports: [NgClass],
  templateUrl: './label-control.html',
  styleUrl: './label-control.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelControl {
  label = input<string>();
  id = input<string>();
  required = input<boolean>();
}
