import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'cf-label-control',
  imports: [NgClass, NzIconDirective],
  templateUrl: './label-control.html',
  styleUrl: './label-control.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelControl {
  label = input<string>();
  id = input<string>();
  icon = input<string>();
  required = input<boolean>();
}
