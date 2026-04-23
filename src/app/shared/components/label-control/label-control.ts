import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@Component({
  selector: 'cf-label-control',
  imports: [NgClass, NzIconDirective, NzSkeletonModule],
  templateUrl: './label-control.html',
  styleUrl: './label-control.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelControl {
  label = input<string>();
  id = input<string>();
  icon = input<string>();
  required = input<boolean>();
  isLoading = input<boolean>();

  @HostBinding('class.full')
  get isFull(): boolean {
    return this.isLoading();
  }
}
