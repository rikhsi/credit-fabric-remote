import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { SelectActionComponent } from '../select-action/select-action.component';
import { Options, TemplateService } from '../../../core/services/template.service';
import { ISelectAction } from '../../interfaces/select-actions.interface';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EspSignConfirmService } from '../../../core/services/esp-confirm.service';
import { UtilsService } from '../../../core/services/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EspSignApplicationComponent
} from '../../../core/components/esp-sign-application/esp-sign-application.component';
import { getStatusApplication } from '../../../core/utils/mixin.utils';
import { DatePipe, NgClass, NgForOf, NgOptimizedImage } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { historyActions } from '../../../views/main/features/transaction-detail/constants/action-btn';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';

@Component({
    selector: 'app-swift-detail',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        SelectActionComponent,
        NgClass,
        NgOptimizedImage,
        MatTooltip,
        DatePipe,
        MatAccordion,
        MatExpansionPanel,
        NgForOf,
        RouterLink
    ],
    templateUrl: './swift-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftDetailComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)
  private _templateService = inject(TemplateService);
  historyOpened = true

  loading = false;

  getActions() {
    if(this.data.buttons.length > 0) {
      return this.data.buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }

  constructor(
    private _matDialog: MatDialog,
    private _matDialogRef: MatDialogRef<SwiftDetailComponent>,
    private destroyRef: DestroyRef,
    private router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
    private templateService: TemplateService,
  ) {
  }

  ngOnInit() {
    this.watchApplicationEsp();
  }

  watchApplicationEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res === 'update-swift') {
            this._matDialogRef.close();
          }
        }
      })
  }

  getHistory() {
    return this.data.userSigns.filter(el => el.isFinished).sort((a, b) => a.signOrderNumber - b.signOrderNumber);
  }

  async printSwiftMessage(transaction: any) {
    const swift = transaction.swiftApplicationDto;
    if(!swift) return;
    swift.docDate = new Date(swift.docDate || Date.now()).toLocaleDateString('ru-Ru', {  year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    await this.printMessage(swift);
  }

  async printMessage(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: 'swift-message.mustache',
      templateData: data,
      templateName: 'SWIFT message'
    };
    await this._templateService.showPdfInDialog(options);
  }

  onAction(action: ISelectAction) {
    switch (action.id) {
      case 'send':
        this.confirm(this.data);
        break;
      case 'sign':
        this.sign(this.data);
        break;
      default:
        console.log(action);
    }
  }

  getTimeFromISO(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-Ru');
  }

  getNarrative(arr: string[]) {
    return arr.map(s => s.replaceAll('/', '')).join(' ');
  }


  confirm(transaction: any) {
    if(!transaction.applicationId) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: {
        applicationId: transaction.applicationId,
        transactionId: transaction.swiftApplicationDto.transactionId,
        updateMessage: 'update-swift',
      },
    }).afterClosed()
      .subscribe(res => {
        if(res === 'update') {
          this.utilsService.updateTransactions.next('update-swift');
          this.toastrService.success('Отправлен в Банк!');
          this._cdRef.detectChanges();
          this._matDialogRef.close('update');
        }
      });
  }

  sign(transaction: any) {
    this.utilsService.spinnerState$$.next(true);
    this.espConfirmService.signApplication({
      transactionId: transaction.swiftApplicationDto.transactionId,
      applicationId: transaction.applicationId,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if(res) {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.success('Отправлен на подпись!');
          this._matDialogRef.close('update');
          this._cdRef.detectChanges();
        }
      },
      error: (err) => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(err?.message || err);
        this._cdRef.detectChanges();
      }
    })
  }

  getDate(isoString: string) {
    return new Date(isoString).toLocaleDateString('ru-Ru');
  }

  convertAmount(amount: number) {
    const integerPart = this.separateNumberByThree(Math.floor(amount / 100));
    const fractionalPart = `${amount % 100}`?.padStart(2, '0');
    return `${integerPart},${fractionalPart}`;
  }

  separateNumberByThree(value: string | number): string {
    const strValue = value.toString();

    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  protected readonly Math = Math;
  protected readonly getStatusApplication = getStatusApplication;
  protected readonly historyActions = historyActions;
}
