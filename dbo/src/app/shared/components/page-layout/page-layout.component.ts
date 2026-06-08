import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-page-layout',
  imports: [RouterLink, IconComponent],
  templateUrl: './page-layout.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLayoutComponent {
  backLink = input('');
  title = input('');
}
