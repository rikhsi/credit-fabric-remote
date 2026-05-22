import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Theme } from '@app/constants/theme';

@Component({
  selector: 'cf-select-theme',
  imports: [NzButtonComponent, NzIconDirective],
  templateUrl: './select-theme.html',
  styleUrl: './select-theme.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTheme {
  public currentTheme = input.required<Theme>();

  public changeTheme = output<void>();
}
