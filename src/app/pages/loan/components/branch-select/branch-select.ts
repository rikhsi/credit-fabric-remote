import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { SelectDefault, SelectDefaultMobile } from '@shared/components';
import { SelectOption } from '@app/typings/select';

@Component({
  selector: 'cf-branch-select',
  imports: [SelectDefault, SelectDefaultMobile, NzOptionComponent, NzIconDirective, TranslocoDirective, FormField],
  templateUrl: './branch-select.html',
  styleUrl: './branch-select.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline]': 'inline()',
  },
})
export class BranchSelect {
  readonly form = input<NzSafeAny>();
  readonly options = input<SelectOption[]>([]);
  readonly inline = input(false);
  readonly isLoading = input(false);
}
