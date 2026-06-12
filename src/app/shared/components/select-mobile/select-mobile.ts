import { ChangeDetectionStrategy, Component, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SelectBottomSheet } from '../select-bottom-sheet/select-bottom-sheet';
import { SelectBottomSheetOption } from '@app/typings/select';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

@Component({
  selector: 'cf-select-mobile',
  templateUrl: './select-mobile.html',
  styleUrl: './select-mobile.less',
  imports: [
    NzSelectModule,
    FormsModule,
    NzIconModule,
    NzFormModule,
    TranslocoDirective,
    ValidationStatusPipe,
    ValidationMsgPipe,
    SelectBottomSheet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMobile extends ControlBaseDirective<number | boolean | string> {
  readonly bottomSheet = viewChild.required(SelectBottomSheet);

  value = model(null);

  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);
  readonly bottomSheetOptions = input<SelectBottomSheetOption[]>([]);

  openBottomSheet(): void {
    if (this.disabled() || !this.bottomSheetOptions().length || this.isLoading()) {
      return;
    }

    this.bottomSheet().open();
    this.clicked.emit();
  }
}
