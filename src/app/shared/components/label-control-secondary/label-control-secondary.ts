import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'cf-label-control-secondary',
  imports: [NgClass, NzIconDirective],
  templateUrl: './label-control-secondary.html',
  styleUrl: './label-control-secondary.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelControlSecondary {
  label = input<string>();
  id = input<string>();
  icon = input<string>();
  required = input<boolean>();
}
