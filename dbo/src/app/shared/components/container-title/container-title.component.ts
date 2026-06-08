import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Location } from '@angular/common';

@Component({
    selector: 'app-container-title',
    imports: [
        MatIcon
    ],
    templateUrl: './container-title.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerTitleComponent {
  @Input() title = '';
  @Input() subTitle = '';
  @Input() hideArrow = false;
  private location = inject(Location);


  back() {
    this.location.back();
  }
}
