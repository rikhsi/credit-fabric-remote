import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { SelectBottomSheetOption } from '@app/typings/select';

@Component({
  selector: 'cf-select-bottom-sheet',
  imports: [FormsModule, NzDrawerModule, NzInputModule, NzIconModule, TranslocoDirective],
  templateUrl: './select-bottom-sheet.html',
  styleUrl: './select-bottom-sheet.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBottomSheet {
  readonly value = model<string | number | boolean | null>(null);
  readonly options = input.required<SelectBottomSheetOption[]>();
  readonly placeholder = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly size = input<NzSizeLDSType>('default');
  readonly isLoading = input<boolean>(false);

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly visible = signal(false);
  readonly search = signal('');

  readonly filteredOptions = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) {
      return this.options();
    }

    return this.options().filter((option) => option.label.toLowerCase().includes(query));
  });

  readonly selectedLabel = computed(() => {
    const currentValue = this.value();

    return this.options().find((option) => option.value === currentValue)?.label ?? '';
  });

  open(): void {
    if (this.disabled() || this.isLoading()) {
      return;
    }

    this.search.set('');
    this.visible.set(true);
    this.opened.emit();
  }

  close(markClosed = true): void {
    this.visible.set(false);

    if (markClosed) {
      this.closed.emit();
    }
  }

  selectOption(option: SelectBottomSheetOption): void {
    this.value.set(option.value);
    this.close();
  }
}
