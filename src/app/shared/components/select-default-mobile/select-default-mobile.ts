import { ChangeDetectionStrategy, Component, input, model, viewChild } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { BottomSheet } from '../bottom-sheet/bottom-sheet';
import { SelectDefault } from '../select-default/select-default';
import { SelectOption } from '@app/typings/select';
import { ControlBaseDirective } from '@shared/directives';

@Component({
  selector: 'cf-select-default-mobile',
  imports: [SelectDefault, NzOptionComponent, BottomSheet],
  templateUrl: './select-default-mobile.html',
  styleUrl: './select-default-mobile.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDefaultMobile extends ControlBaseDirective<number | boolean | string> {
  readonly bottomSheet = viewChild.required(BottomSheet);

  value = model(null);

  readonly options = input.required<SelectOption[]>();
  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);

  openSheet(): void {
    if (this.disabled() || !this.options().length || this.isLoading()) {
      return;
    }

    this.bottomSheet().open();
    this.clicked.emit();
  }

  onSheetClosed(): void {
    this.onBlur();
  }
}
