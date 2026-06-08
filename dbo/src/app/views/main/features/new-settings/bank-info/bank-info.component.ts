import {Component, DestroyRef, inject, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { MatDialogRef } from '@angular/material/dialog';
import {debounceTime, take} from "rxjs";
import {FormControl, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";

import {MfoInfoComponent} from "./companents/mfo-info/mfo-info.component";
import {DestinationCodeInfoComponent} from "./companents/destination-code-info/destination-code-info.component";
import {TreasuryAccountsInfoComponent} from "./companents/treasury-accounts-info/treasury-accounts-info.component";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {BudgetAccountsInfoComponent} from "./companents/budget-accounts-info/budget-accounts-info.component";
import {PurposeTransferComponent} from "./companents/purpose-transfer-info/purpose-transfer-info.component";


@Component({
  selector: "app-organization",
  templateUrl: "./bank-info.component.html",
  styleUrls: ["./bank-info.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    NgClass,
    ReactiveFormsModule,
    MfoInfoComponent,
    DestinationCodeInfoComponent,
    TreasuryAccountsInfoComponent,
    TranslateModule,
    BudgetAccountsInfoComponent,
    PurposeTransferComponent
  ]
})

export class BankInfoComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  selected = false
  editing =false;
  search = new FormControl('');
  #destroy = inject(DestroyRef)
  bankInfoItemsWithCode = signal<any>([]);
  totalItems = signal<number>(0)
  activeTabIndex = signal<number>(1)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(10)
  isLoading = signal<boolean>(false)
  tabMenu = [
    { id: 1, name: this.translateService.instant('settings.bank_mfos') },
    { id: 2, name: this.translateService.instant('settings.purpose_codes') },
    { id: 3, name: this.translateService.instant('settings.treasury_accounts') },
    { id: 4, name:  this.translateService.instant("custom.setting_budget_accounts")},
    { id: 5, name: this.translateService.instant("custom.setting_card_transfer_purposes")},
  ];

  constructor(
    public router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  changeTab(id: number) {
    if (!id) return
    this.activeTabIndex.set(Number(id));
  }
  goLocation(){
    this.router.navigate(['new-locations']);
  }
}
