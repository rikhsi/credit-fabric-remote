import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-data',
  imports: [],
  templateUrl: './no-data.component.html',
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoDataComponent {

}
