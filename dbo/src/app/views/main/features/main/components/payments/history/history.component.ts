import {ChangeDetectionStrategy, Component} from "@angular/core";
import {MatExpansionModule} from "@angular/material/expansion";
import {PaymentsComponent} from "../payments.component";

@Component({
  selector: 'app-history',
  imports: [
    MatExpansionModule,
    PaymentsComponent,
  ],
  templateUrl: './history.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class HistoryComponent {

}
