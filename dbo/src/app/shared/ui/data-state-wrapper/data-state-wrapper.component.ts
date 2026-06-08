import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

type DataState = 'empty' | 'emptySearch' | 'content';

@Component({
  selector: 'app-data-state-wrapper',
  imports: [
    EmptyStateComponent,
    MatProgressSpinner,
  ],
  templateUrl: './data-state-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataStateWrapperComponent {
  readonly loading = input<boolean>(true);
  readonly totalLength = input<number | null>(null);
  readonly filteredLength = input<number | null>(null);

  readonly loadingTitle = input<string>('Загружаем данные');
  readonly loadingDescription = input<string | null>('Пожалуйста, подождите');

  readonly emptyTitle = input<string>('Нет данных');
  readonly emptyDescription = input<string | null>(null);

  readonly searchEmptyTitle = input<string>('Ничего не найдено');
  readonly searchEmptyDescription = input<string | null>('Попробуйте изменить параметры поиска');

  readonly state = computed<DataState>(() => {
    const total = this.totalLength() ?? 0;
    const filtered = this.filteredLength() ?? total;

    if (total === 0) return 'empty';
    if (filtered === 0) return 'emptySearch';

    return 'content';
  });
}
