import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  OnDestroy,
  OnInit, signal,
  ViewEncapsulation
} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {Subject, takeUntil} from "rxjs";
import {CorpCardService} from "./services/corp-card.service";
import {CorpCardListContent} from "./models/corp-card.model";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {MatDialog} from "@angular/material/dialog";
import {NgIf} from "@angular/common";
import {UtilsService} from "../../../../core/services/utils.service";
import {ContainerNavComponent} from "../../../../shared/components/container-nav/container-nav.component";
import {animate, style, transition, trigger} from "@angular/animations";
import {CorpCard, CorpCardsTableColumnsHeaders} from "../accounts-and-payments/constants/table-columns";
import {ContainerTableComponent} from "../../../../shared/components/common/container-table/container-table.component";
import {TableActionsComponent} from "../../../../shared/components/table-actions/table-actions.component";
import {CorpCardsTableActionBtns} from "../accounts-and-payments/constants/table-btns";
import {CorpCardInfoComponent} from "./components/corp-card-info/corp-card-info.component";

@Component({
  selector: 'app-corp-cards',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgIf,
    ContainerNavComponent,
    ContainerTableComponent,
    TableActionsComponent
  ],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({height: 0, opacity: 0}),
        animate('300ms ease-out', style({height: '*', opacity: 1})),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({height: 0, opacity: 0})),
      ]),
    ]),
  ],
  templateUrl: './corp-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CorpCardsComponent implements OnInit, OnDestroy {
  unsub$ = new Subject<void>();
  selectedRows: any[] = [];
  corpCardList = signal<CorpCardListContent[]>([])
  private router = inject(Router)

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  advertisements = signal<{ currency: string, name: string, description: string, img: string }[]>([
    {
      img: './assets/svg/uzcard-card.svg',
      description: 'Бизнес-платежи и расчёты в долларах без границ',
      currency: "UZS",
      name: 'UzCard Business'
    },
    {
      img: './assets/svg/humo-card.svg',
      description: 'Бизнес-платежи и расчёты в долларах без границ',
      currency: "UZS",
      name: 'Humo Business'
    },
    {
      img: './assets/svg/visa-card.svg',
      description: 'Бизнес-платежи и расчёты в долларах без границ',
      currency: "USD",
      name: 'Visa Business'
    },
    {
      img: './assets/svg/visa-card.svg',
      description: 'Бизнес-платежи и расчёты в долларах без границ',
      currency: "EUR",
      name: 'Visa Business'
    }
  ])
  isOpen = signal(true);
  navs = signal([
    {
      title: 'Главная',
      link: '/main'
    },
    {
      title: 'Корпоративные карты',
      link: ''
    },
  ]);
  isLoading = signal(false)
  private _utilsService = inject(UtilsService)
  tableActionBtns = CorpCardsTableActionBtns;

  constructor(
    private _cardService: CorpCardService,
    private cf: ChangeDetectorRef,
    private matDialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.getCardsList()
  }


  onActionClick(id: string) {
    switch (id) {
      case 'replenish':
        return this.navigateToReplenish()
      case 'transaction-history':
        return this.navigateToTransactionHistory()
    }
  }

  navigateToReplenish() {
    this.router.navigate(['/corp-card-replenish'])
  }

  navigateToTransactionHistory() {
    this.router.navigate(['/corp-card-transaction-history'])
  }

  getCardsList() {
    this.isLoading.set(true)
    this._cardService.getCorpCardList().pipe(takeUntil(this.unsub$)).subscribe(res => {
        if (res) {
          const corpCards = res.content.map(res=>{
            return {
              ...res,
              account:res.account.slice(6)
            }
          })
          this.corpCardList.set(corpCards)
          this.isLoading.set(false)
        }
      }
    )
  }

  openCopCardInfo(data: CorpCard) {
    this.matDialog.open(CorpCardInfoComponent, {
      data: data,
      width: '480px',
      height: 'calc(100% - 32px)',
      position: {right: '16px'},
      panelClass: 'right-side-dialog',
    })

  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];
    this.cf.detectChanges();
  }

  toggleForAnyElement() {
    if (this.selectedRows.length) {
      this.tableActionBtns.forEach(el => {
        el.active = true;
      });
    } else {
      this.tableActionBtns.forEach(el => {
        el.active = false;
      })
    }
  }

  ngOnDestroy() {
    this.unsub$.next()
    this.unsub$.complete()
  }

  protected readonly tableColumns = CorpCardsTableColumnsHeaders;

}
