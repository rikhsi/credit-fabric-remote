import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { SalaryProjectService } from '../../../core/services/salary-project.service';
import { MatDialog } from '@angular/material/dialog';
import { ChooseCardTypeComponent } from '../../../views/main/features/payroll-project/components/choose-card-type/choose-card-type.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilsService } from '../../../core/services/utils.service';
import { RosterComponent } from '../../../views/main/features/payroll-project/components/roster/roster.component';
import { PageLayoutComponent } from '../../../shared/components/page-layout/page-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { MatTooltip } from '@angular/material/tooltip';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import {TransactionService} from "../../../core/services/transaction.service";
import {
  KartotekaModalComponent
} from "../../../views/main/features/add-payment/modals/kartoteka-modal/kartoteka-modal.component";

@Component({
  selector: 'app-payroll-project',
  standalone: true,
  imports: [
    RouterLink,
    RosterComponent,
    PageLayoutComponent,
    TranslateModule,
    MatTooltip,
    IconComponent,
  ],
  templateUrl: './statements-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementsPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly salaryService = inject(SalaryProjectService);
  readonly #destroy = inject(DestroyRef);
  private readonly utilsService = inject(UtilsService);
  private readonly transactionService = inject(TransactionService);
  public userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(params => {
        if (params['isKartoteka'] === 'kartoteka') {
          this.openChooseCardType();
        }
      });
  }

  openKartotekaModal(data: { count: number, totalAmount: { amount: number } }) {
    this.dialog.open(KartotekaModalComponent, {
      data: data,
      width: "467px",
      minHeight: "620px"
    });
  }

  getCardType(hasKartoteka: boolean) {
    this.salaryService.getAllPayrollProjectGroupList(
      {
        page: 0,
        size: 100,
        userType: 'SALARY',
      }
    ).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (!res) return this.utilsService.spinnerState$$.next(false)
        if (res.content?.length === 1) {
          this.router.navigate(
            ['/payroll-project/statements/create'],
            {
              queryParams: {
                contractNumber: res.content[0].contractNumber,
                cardType: res.content[0].type,
                count: res.content[0].count,
                transitAccount: res.content[0].transitAccount,
                isKartoteka: hasKartoteka ? 'kartoteka' : undefined,
              }
            }
          );
          return this.utilsService.spinnerState$$.next(false)
        }
        this.dialog.open(ChooseCardTypeComponent, {
          width: '540px',
          data: {
            content: res.content,
            hasKartoteka: hasKartoteka,
          }
        })
        this.utilsService.spinnerState$$.next(false)
      }
    )
  }


  openChooseCardType() {
    this.utilsService.spinnerState$$.next(true);
    this.transactionService.checkKartoteka('SALARY').pipe().subscribe((res) => {
      if (!res) return this.utilsService.spinnerState$$.next(false);
      if (res.hasKartoteka2) {
        res.data.length === 0 ?
          this.openKartotekaModal(res.kartoteka2Details) :
          this.getCardType(true);
      } else {
        this.getCardType(false);
      }
    })
  }
}
