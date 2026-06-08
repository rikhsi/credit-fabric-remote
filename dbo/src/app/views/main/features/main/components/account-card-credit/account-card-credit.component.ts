import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {NgClass, NgIf, SlicePipe} from "@angular/common";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {NgxMaskPipe} from "ngx-mask";
import {MatRipple} from "@angular/material/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-account-card-credit',
  imports: [
    NgClass,
    NgxMaskPipe,
    MatRipple,
    SlicePipe,
    NgIf
  ],
    templateUrl: './account-card-credit.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountCardCreditComponent {
  constructor(protected router: Router) {}
  isLoading = input<boolean>(false);
  accounts = input<AccountsDto[]>()
  activeTab = signal<number>(0)
  tabs = signal<string[]>(['Счета', 'Карты', 'Кредиты'])
  accountRequisite = output<{  account: string, codeFilial: string, id: string  }>()
  openAccountListPupUp = output()
  protected readonly String = String;
}
