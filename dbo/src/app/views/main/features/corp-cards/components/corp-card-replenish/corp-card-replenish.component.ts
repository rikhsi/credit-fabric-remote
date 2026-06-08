import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {NgIf} from "@angular/common";
import {
  AccountsListPaymentsComponent
} from "../../../add-payment/modals/account-list-modal/account-list-modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-corp-card-replenish',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        NgIf
    ],
    templateUrl: './corp-card-replenish.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardReplenishComponent {

  navs = signal([
    {
      title: 'Главная',
      link: '/main'
    },
    {
      title: 'Корпоративные карты',
      link: '/corp-cards'
    },
    {
      title: 'Пополнить',
      link: ''
    },
  ]);
  private _dialog = inject(MatDialog)




  getAccounts() {
    this._dialog.open(AccountsListPaymentsComponent, {
      data: {},
      width: '600px',
      height: 'calc(100% - 32px)',
      position: {
        right: '16px',
      },
      panelClass: 'right-side-dialog',
    })
  }
}
