import {
  ChangeDetectionStrategy,
  Component,

} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-statements-history-v2',
  imports: [
    RouterOutlet
  ],
  styleUrls: ['./statements-history-v2.component.scss'],

  templateUrl: './statements-history-v2.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementsHistoryV2Component {

}
