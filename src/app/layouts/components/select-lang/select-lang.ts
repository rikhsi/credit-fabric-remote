import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { TranslocoDirective } from '@jsverse/transloco';
import { LangFlagPipe } from '@layouts/pipes';
import { Language } from '@constants';
import { EnumItemsPipe } from '@shared/pipes';

@Component({
  selector: 'cf-select-lang',
  imports: [NzButtonComponent, NzIconDirective, LangFlagPipe, NzDropdownModule, EnumItemsPipe, TranslocoDirective],
  templateUrl: './select-lang.html',
  styleUrl: './select-lang.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLang {
  public currentLang = input.required<Language>();

  public changeLang = output<string>();
}
