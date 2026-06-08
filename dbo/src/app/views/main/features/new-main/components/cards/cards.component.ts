import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  input, OnChanges,
  output,
  SimpleChanges
} from '@angular/core';
import {PayrollProjectResponseContent} from "../../../payroll-project/models/payroll-project.type";
import {NgxMaskPipe} from "ngx-mask";
import {maskNumberMiddle} from "../../../../../../core/utils/mixin.utils";
import {getSelectedData} from "../../../../../../core/utils/form-filter.util";
import {statusList} from "../../../corp-card-project/constants/corp-card-constants";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {BlockCardDialogComponent} from "../../../corp-card-project/component/dialogs/block-card/block-card";
import {MatDialog} from "@angular/material/dialog";
import {CardStore} from "../../../../../../store/card.store";
import {CorpCardLimitStore} from "../../../corp-card-project/store/limit.store";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import {TitleChangeCardComponent} from "../../../corp-cards/components-2/title-change-card/title-change-card.component";
import {Router} from "@angular/router";
import {LimitDialogComponent} from "../../../corp-card-project/component/dialogs/limit/list/limit-list";
import {CorpCardInfoRequsite} from "../../../corp-card-project/component/dialogs/card-requisite/requisite";
import {ThemeService} from "../../../../../../shared/services/theme.service";


@Component({
  selector: 'app-cards',
  imports: [NgxMaskPipe, NgClass, NgOptimizedImage, TranslateModule, NgIf, MatMenu, MatMenuTrigger],
  templateUrl: './cards.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent implements OnChanges{
  private router = inject(Router);
  refreshCardList = output<void>();
  private dialog = inject(MatDialog);
  protected readonly cardStore = inject(CardStore)
  protected readonly corpCardLimitStore = inject(CorpCardLimitStore);
  theme = inject(ThemeService)

  cards = input<PayrollProjectResponseContent[] | null>([])
  protected readonly maskNumberMiddle = maskNumberMiddle;


  ngOnChanges(changes: SimpleChanges) {
    console.log(11,changes);
  }

  protected getStatusLogo(status: string | undefined): string {
    if(!status) return '';
    return getSelectedData(status?.toUpperCase(),  this.statusList , 'type')?.img || '';
  }
  protected statusList = statusList

  protected openCardBlockDialog(card: any): void {
    if (!card) return
    const dialogRef = this.dialog.open(BlockCardDialogComponent, {
      data: card,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == "success") {
        // this.cardStore.loadCards();
          this.refreshCardList.emit();

      }
    });
  }
  protected onMenuOpened(event: any , cardId: string = ''): void {
    event.stopPropagation();
    if(!cardId) return
    this.corpCardLimitStore.loadLimitInfo({id:cardId});
    this.corpCardLimitStore.loadLimitHistory({id:cardId});
  }
  changeTitle(card){
    if (!card?.uuid) return;
    const dialogRef = this.dialog.open(TitleChangeCardComponent, {
      data: {title: card.title, uuid: card.uuid},
      width: '400px',
    });
    dialogRef.componentInstance.change.subscribe(() => {
      dialogRef.close();
      this.refreshCardList.emit();
    });
  }
  protected navigateToDetails(card) {
    this.router.navigate([`corp-card-project/corp-card-details/${card?.uuid}`])
  }
  protected openLimitListDialog(card): void {
    this.dialog.open(LimitDialogComponent, {
      data: {
        cardId: card?.uuid,
        info: this.corpCardLimitStore.limitInfo(),
        histories: this.corpCardLimitStore.limitHistory(),
        hasLimit: this.corpCardLimitStore.limitInfo()?.isActive
      },
      width: '517px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }
  protected openCardRequisites(card: any): void {
    if (!card) return;
    this.dialog.open(CorpCardInfoRequsite, {
      data: card,
      width: '475px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }
}
