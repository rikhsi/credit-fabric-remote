import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-select-date',
  imports: [FormsModule, NzFormModule, NzDatePickerModule, TranslocoDirective, ValidationStatusPipe, ValidationMsgPipe],
  templateUrl: './select-date.html',
  styleUrl: './select-date.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDate extends ControlBaseDirective<Date | null> {
  value = model(null);
  readonly format = input<string>('dd.MM.yyyy');
  readonly maxDate = input<Date | null>(null);
  readonly minDate = input<Date | null>(null);

  protected onOpenChange(open: boolean): void {
    if (!open) this.blurChange.emit();
  }

  protected disabledDate = (current: Date): boolean => {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && current < min) return true;
    if (max && current > max) return true;
    return false;
  };
}
