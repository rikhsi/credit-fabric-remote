import { Component, inject, OnInit } from '@angular/core';
import { ReserveCardComponent } from "../reverves-card/reverve-card.component";
import { Kartoteka2Store } from '../../../store/kartoteka2.store';
import { MatDialog } from '@angular/material/dialog';
import { BronDetailsComponent } from '../bron-details/bron-details.component';
import { NeedsDetailsComponent } from '../needs-details/needs-details.component';
import {NgClass, NgIf} from "@angular/common";
import {BronListComponent} from "../bron-list/bron-list.component";

@Component({
  selector: 'app-reserves',
  standalone: true,
  imports: [ReserveCardComponent, NgIf, NgClass],
  templateUrl: './reserves.component.html',
  styleUrls: ['./reserves.component.scss'],

})
export class ReservesComponent implements OnInit {
  protected kartoteka2Store = inject(Kartoteka2Store)
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.kartoteka2Store.getReservationList()
    this.kartoteka2Store.getNeedsList()
  }

  openBronDetails(item: any) {
    this.dialog.open(BronDetailsComponent, {
      data: item,
      width: '550px',
      height: 'calc(100% - 16px)',
      position: {
          right: '0',
        },
      panelClass: 'right-side-dialog',
    });
  }

  openBronList() {
    this.dialog.open(BronListComponent, {
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
    })
  }

  openNeedsDetails(item: any) {
    this.dialog.open(NeedsDetailsComponent, {
      data: item,
      width: '550px',
      height: 'calc(100% - 16px)',
      position: {
          right: '0',
        },
      panelClass: 'right-side-dialog',
    });
  }
}
