import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-balance-item',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgxMaskPipe
  ],
  templateUrl: './balance-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceItemComponent {
  @Input() title = '';
  @Input() svg = '';
  @Input() amount = 0;
  @Input() currency = '';
  @Input() scale = 0;
  protected readonly Math = Math;
  protected readonly toString = toString;
}
