import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SelectBottomSheetOption } from '@app/typings/select';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-select-bottom-sheet',
  imports: [FormsModule, NzDrawerModule, NzInputModule, NzIconModule, NzButtonComponent, BounceDirective, TranslocoDirective],
  templateUrl: './select-bottom-sheet.html',
  styleUrl: './select-bottom-sheet.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBottomSheet {
  readonly value = model<string | number | boolean | null>(null);
  readonly options = input.required<SelectBottomSheetOption[]>();
  readonly placeholder = input<string | null>(null);

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

  open(): void {
    this.search.set('');
    this.visible.set(true);
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
