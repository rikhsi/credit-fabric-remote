import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Card } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { SelectOption } from '@app/typings/select';

@Component({
  selector: 'cf-branch-info',
  imports: [
    Card,
    NzButtonComponent,
    NzIconDirective,
    NzSpinComponent,
    NzTypographyComponent,
    NzTagComponent,
    TranslocoDirective,
    BounceDirective,
  ],
  templateUrl: './branch-info.html',
  styleUrl: './branch-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchInfo {
  readonly filialCode = input<number | null>(null);
  readonly options = input<SelectOption[]>([]);
  readonly isLoading = input(false);

  readonly isFilled = computed(() => this.filialCode() != null);

  readonly selectedLabel = computed(() => {
    const code = this.filialCode();

    if (code == null) {
      return '';
    }

    return this.options().find((option) => option.value === code)?.label ?? String(code);
  });

  readonly edit = output<void>();

  onFill(): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit();
  }
}
