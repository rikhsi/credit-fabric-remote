import {Component, inject, input, OnInit, signal} from '@angular/core';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {NgClass, NgIf} from "@angular/common";
import {CreateModalKartotekaComponent} from "../create-modal/create-modal-kartoteka.component";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../../../core/services/user.service";
import {InfoModalComponent} from "../info-modal/info-modal.component";


@Component({
  selector: 'app-reserve-card',
  standalone: true,
  imports: [
    MatTooltip,
    MatTooltipModule,
    NgIf,
    NgClass,
  ],
  templateUrl: './reserve-card.component.html',
  styleUrls: ['./reserve-card.component.scss'],
})


export class ReserveCardComponent implements OnInit {
  title = input<string>("");
  typeReserve = input<string>("");
  clAcc = input<string>("");
  accountLabel = input<string>("");
  issue = input<number>(0);
  sumNeedPay = input<number>(0);
  sumNeed = input<number>(0);

  permissionsList = signal<{ module: string, types: [string] }[]>([]);

  dialog = inject(MatDialog);
  userService = inject(UserService);
  matDialog = inject(MatDialog);


  ngOnInit() {
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }
  }

  get issuePercent(): number {
    if (!this.sumNeed) return 0;
    return (100 * this.issue()) / this.sumNeed();
  }

  get payPercent(): number {
    if (!this.sumNeed) return 0;
    return (100 * this.sumNeedPay()) / this.sumNeed();
  }

  protected formatMoney(value: number | string): { formattedInteger: any, decimal: any } {
    const num = Number(value);
    const [integer, decimal] = num.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return { formattedInteger, decimal };
  }

  openKartoteka2Info() {
    this.matDialog.open(InfoModalComponent, {
      data: {type: this.typeReserve().toUpperCase()},
      width: "481px",
      minHeight: "426px"
    })
  }

  openBronCreate() {
    this.dialog.open(CreateModalKartotekaComponent, {
      data: {
        permissions: this.permissionsList(),
        type: this.typeReserve(),
      },
      width: '475px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
    })
  }

  protected formatAccount(clAcc: string): string {
    if (!clAcc || clAcc.length < 9) return clAcc;
    const start = clAcc.slice(0, 5);
    const end = clAcc.slice(-4);
    return `${start}••${end}`;
  }
}
