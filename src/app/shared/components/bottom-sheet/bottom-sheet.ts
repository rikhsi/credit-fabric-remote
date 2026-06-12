import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SelectOption } from '@app/typings/select';
import { BounceDirective } from '@shared/directives';

const SWIPE_CLOSE_THRESHOLD = 72;

@Component({
  selector: 'cf-bottom-sheet',
  imports: [FormsModule, NzDrawerModule, NzInputModule, NzIconModule, NzButtonComponent, BounceDirective, TranslocoDirective],
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheet {
  readonly visible = model(false);
  readonly value = model<string | number | boolean | null>(null);
  readonly title = input<string>('');
  readonly options = input<SelectOption[]>([]);
  readonly showSearch = input<boolean>(true);

  readonly closed = output<void>();

  readonly search = signal('');
  private touchStartY = 0;
  private touchDeltaY = 0;

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
    this.touchStartY = 0;
    this.touchDeltaY = 0;

    if (markClosed) {
      this.closed.emit();
    }
  }

  selectOption(option: SelectOption): void {
    this.value.set(option.value);
    this.close();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0]?.clientY ?? 0;
    this.touchDeltaY = 0;
  }

  onTouchMove(event: TouchEvent): void {
    const currentY = event.touches[0]?.clientY ?? 0;
    this.touchDeltaY = Math.max(0, currentY - this.touchStartY);
  }

  onTouchEnd(): void {
    if (this.touchDeltaY >= SWIPE_CLOSE_THRESHOLD) {
      this.close();
    }

    this.touchStartY = 0;
    this.touchDeltaY = 0;
  }
}
