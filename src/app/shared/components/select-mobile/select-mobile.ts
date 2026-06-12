import { ChangeDetectionStrategy, Component, computed, contentChildren, input, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SelectBottomSheet } from '../select-bottom-sheet/select-bottom-sheet';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';
import { mapNzOptionsToBottomSheet } from '@shared/utils/select-option';

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
  readonly optionList = contentChildren(NzOptionComponent);
  readonly bottomSheet = viewChild.required(SelectBottomSheet);

  value = model(null);

  readonly showSearch = input<boolean>(true);
  readonly isLoading = input<boolean>(false);

  readonly selectOptions = computed(() => mapNzOptionsToBottomSheet(this.optionList()));

  openBottomSheet(): void {
    if (this.disabled() || !this.optionList().length || this.isLoading()) {
      return;
    }

    this.bottomSheet().open();
    this.clicked.emit();
  }
}
