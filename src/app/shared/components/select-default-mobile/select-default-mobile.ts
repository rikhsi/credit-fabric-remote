import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal, viewChild } from '@angular/core';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { BottomSheet } from '../bottom-sheet/bottom-sheet';
import { SelectDefault } from '../select-default/select-default';
import { HandbookRequest } from '@app/typings/handbook';
import { SelectOption } from '@app/typings/select';
import { ControlBaseDirective } from '@shared/directives';
import { fetchHandbookItems, mapHandbookItemsToSelectOptions } from '@shared/utils/handbook-select';

@Component({
  selector: 'cf-select-default-mobile',
  imports: [SelectDefault, NzOptionComponent, BottomSheet],
  templateUrl: './select-default-mobile.html',
  styleUrl: './select-default-mobile.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDefaultMobile extends ControlBaseDirective<number | boolean | string> {
  private readonly http = inject(HttpClient);

  readonly bottomSheet = viewChild.required(BottomSheet);

  value = model(null);

  readonly handbook = input.required<HandbookRequest>();
  readonly showSearch = input<boolean>(true);

  readonly options = signal<SelectOption[]>([]);
  readonly handbookLoading = signal(false);

  constructor() {
    effect((onCleanup) => {
      const request = this.handbook();

      if (!request?.url) {
        this.options.set([]);
        this.handbookLoading.set(false);

        return;
      }

      this.handbookLoading.set(true);

      const subscription = fetchHandbookItems(this.http, request).subscribe({
        next: (items) => {
          this.options.set(mapHandbookItemsToSelectOptions(items));
          this.handbookLoading.set(false);
        },
        error: () => {
          this.options.set([]);
          this.handbookLoading.set(false);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });

    super();
  }

  openSheet(): void {
    if (this.disabled() || this.handbookLoading()) {
      return;
    }

    this.bottomSheet().open();
    this.clicked.emit();
  }

  onSheetClosed(): void {
    this.onBlur();
  }
}
