import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-container-nav',
    imports: [
        RouterLink
    ],
    templateUrl: './container-nav.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerNavComponent {
  @Input() navs: { title: string, link: string, tab?: string }[] = [
    {
      title: '',
      link: '',
    },
  ]
}
