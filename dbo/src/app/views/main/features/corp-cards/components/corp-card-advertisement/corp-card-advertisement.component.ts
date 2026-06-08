import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {
  ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {PaginatorComponent} from "../../../../../../shared/components/paginator/paginator.component";
import {TableActionsComponent} from "../../../../../../shared/components/table-actions/table-actions.component";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatDialog} from "@angular/material/dialog";
import {CorpCardActionsDialogComponent} from "../corp-card-actions-dialog/corp-card-actions-dialog.component";

@Component({
    selector: 'app-corp-card-advertisement',
    imports: [
        ContainerNavComponent,
        ContainerTableComponent,
        ContainerTitleComponent,
        FilterButtonComponent,
        PaginatorComponent,
        TableActionsComponent,
        UiSvgIconComponent
    ],
    templateUrl: './corp-card-advertisement.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardAdvertisementComponent {
  private _dialog = inject(MatDialog)
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
      title: 'Открыть корпоративную карту',
      link: ''
    },
  ]);
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

  createCard() {
   let dialogRef =  this._dialog.open(CorpCardActionsDialogComponent,{
      data:{
        img:'./assets/svg/alert-triangle.svg',
        title:'Заказать карту?',
        desc:'Вы действительно хотите оформить заказ на получение этой карты'
      }
    })
    dialogRef.componentInstance.actions.subscribe(()=>{
      dialogRef.close()
    })

  }
}
