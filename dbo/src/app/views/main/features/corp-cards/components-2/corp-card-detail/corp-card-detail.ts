
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { tap } from 'rxjs';
import { CommonModule } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { MatDialog } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
// import { CorpCardHistoryComponent } from "../corp-card-history/corp-card-history";
import { CardStore } from "src/app/store/card.store";
import { CorpCardInfoComponent } from "../../components/corp-card-info/corp-card-info.component";
import {
  SessionsDialogComponent
} from "../../../new-settings/components/settings-dialogs/sessions-dialog/sessions-dialog.component";
// import {LimitDialogComponent} from "../../../corp-card-project/component/dialogs/limit/edit/edit-limit";
import { CorpCardHistoryComponent } from "../../../corp-card-project/component/corporative-card-history/corp-card-history";

@Component({
  selector: 'corp-card-detail',
  imports: [CommonModule, CorpCardHistoryComponent, RouterLink, NgxMaskPipe],
  templateUrl: './corp-card-detail.html',
})


export class CorpCardDetailComponent implements OnInit {
  constructor(
    private destroyRef: DestroyRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  readonly cardStore = inject(CardStore)
  readonly dialog = inject(MatDialog)
  cardId = "";
  accountNumber = '';
  accountId = '';

  ngOnInit() {
    this.cardId = this.route.snapshot.paramMap.get('id')!;
    this.getCardDataFromQuearyParams()

  }

  private getCardDataFromQuearyParams() {
    this.route.queryParams.pipe(
      tap(params => {
        if (params['data']) {
          try {
            let card = JSON.parse(decodeURIComponent(params['data']));
          } catch (e) {
            console.error('failed to parse card from query param', e);
          }
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  protected openCardInfo(cardId: string): void {
    if (!cardId) return;
    // const card = this.cardStore.cards().find(c => c.uuid === cardId);
    //  if (!card) return;

    this.dialog.open(CorpCardInfoComponent, {
      data: cardId,
      width: '475px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }
  // openLimitDialog(){
  //   this.dialog.open(LimitDialogComponent, {
  //     data: {},
  //     width: '540px',
  //     height: 'calc(100% - 16px)',
  //     position: {
  //       right: '0',
  //     },
  //     panelClass: 'right-side-dialog',
  //   })
  // }
  protected readonly Number = Number;
}
