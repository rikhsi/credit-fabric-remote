import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { StatementFormComponent } from "../../../features/payroll/statement-form/statement-form.component";
import { TranslateModule } from "@ngx-translate/core";
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { MatDialog } from '@angular/material/dialog';
import { StatementFormStore } from '../../../features/payroll/statement-form/statement-form.store';
import { STATEMENT_MODE } from '../../../features/payroll/statement-form/statement-form.model';
import {
  SalaryStatementSummaryComponent
} from '../../../widgets/salary-statement-summary/salary-statement-summary.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import {FirebaseAnalyticsService} from "../../../../../firebase-analytics.service";

@Component({
  selector: 'app-statement-form-page',
  imports: [
    StatementFormComponent,
    TranslateModule,
    IconComponent,
    SalaryStatementSummaryComponent
  ],
  providers: [StatementFormStore],
  templateUrl: './statement-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly store = inject(StatementFormStore);

  constructor(
    private analyticsService: FirebaseAnalyticsService,
  ) {
    const snapshot = this.route.snapshot;
    if (snapshot.data['mode'] === STATEMENT_MODE.CREATE) {
      this.store.create(
        snapshot.data['mode'],
        snapshot.queryParams['contractNumber'],
        snapshot.queryParams['cardType'],
        snapshot.queryParams['count'],
        snapshot.queryParams['transitAccount'],
      );
    } else {
      this.store.init(snapshot.data['mode'], snapshot.params['transactionId']);
    }
  }

  ngOnInit() {
    this.analyticsService.logFirebaseCustomEvent('create_payroll_screen_jump', null);
  }

  confirmCancelPayrollStatement() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        icon: 'alertTriangle',
        title: 'salaryStatements.confirm_close_statement',
        description: 'salaryStatements.changes_lost',
      },
      width: '480px',
    }).afterClosed().subscribe((res) => {
      if (res === 'confirm') {
        this.router.navigate(['payroll-project', 'statements']);
      }
    });

  }

  onSubmit() {
    const store = this.store;
    this.store.submitted.set(true);
    this.store.form.markAllAsTouched();

    const invalidForm = this.store.form.status === 'INVALID';
    const useTransit = store.salaryPrepareUseTransit();
    const senderAccount = store.selectedSenderAccount();
    const bronAmount = store.bronAmount();
    const senderAccountIssue = !bronAmount && useTransit && (!senderAccount || senderAccount.status === 'BLOCKED');
    if (invalidForm || store.invalidAmount() || !store.total() || senderAccountIssue) return;

    this.store.prepareSalaryCardTransaction().subscribe(res => {
      if (!res) return;
      this.analyticsService.logFirebaseCustomEvent('create_payroll_success', {transfer_id: res?.transactionId?.length && res?.transactionId[0]  ? res.transactionId[0] : undefined});
      this.router.navigate(['payroll-project', 'statements', res.parentId]);
    });
  }
}
