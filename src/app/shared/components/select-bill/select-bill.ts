import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'cf-select-bill',
  imports: [NzDropdownModule, NgTemplateOutlet, NzIconDirective, NzTypographyComponent],
  templateUrl: './select-bill.html',
  styleUrl: './select-bill.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBill {
  readonly = input<boolean>(false);
  accountNo = input<string>();
}
