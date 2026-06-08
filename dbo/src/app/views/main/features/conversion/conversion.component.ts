import {ChangeDetectionStrategy, Component, inject, OnInit} from "@angular/core";
import {routeAnimation} from "../../../../core/animations/route.animation";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {PaymentsComponent} from "./components/table/table.component";
import {MatDialog} from "@angular/material/dialog";
import {RateModalComponent} from "./components/modals/rate-modal/rate-modal.component";


@Component({
  selector: 'app-conversion',
  animations: [routeAnimation],
  imports: [CommonModule, RouterModule, TranslateModule, PaymentsComponent],
  templateUrl: './conversion.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ConversionComponent implements OnInit {

  private readonly dialog = inject(MatDialog);

  ngOnInit() {

  }

  openRateDialog() {
    this.dialog.open(RateModalComponent, {
      width: '650px',
      height: '612px',
      data: {

      }
    })
  }

}
