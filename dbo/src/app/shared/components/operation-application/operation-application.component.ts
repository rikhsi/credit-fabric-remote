import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { getStatusApplication } from '../../../core/utils/mixin.utils';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { SwiftDetailComponent } from '../swift-detail/swift-detail.component';
import { ApplicationDetailComponent } from '../application-detail/application-detail.component';
import {
  ConversionCrossDetailComponent
} from '../../../views/main/features/applications/components/conversion-cross-detail/conversion-cross-detail.component';
import { AppInfoComponent } from '../../../views/main/features/applications/components/app-info/app-info.component';

@Component({
    selector: 'app-operation-application',
    imports: [
        NgOptimizedImage,
        NgClass
    ],
    templateUrl: './operation-application.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationApplicationComponent implements OnInit {
  @Input() app!: any;
  svgContent: SafeHtml = '';

  @Output() update = new EventEmitter();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private _cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private matDialog: MatDialog,
    ) {
  }

  ngOnInit() {
    this.getSvgContent();
  }

  getAmount() {
    let res = '';
    switch (this.app?.applicationType) {
      case 'CONVERSION_CROSS':
        res = this.getAmountCross()
        break;
      case 'CONVERSION_BUY':
        res = this.getAmountBuy()
        break;
      case 'CONVERSION_SELL':
        res = this.getAmountSell()
        break;
      default:
        res = this.getAmountSwift()
    }
    return res;
  }

  getTime() {
    const date = new Date(this.app.createdDate);
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  getAmountSwift() {
    const integerPart = Math.floor(this.app?.swiftApplicationDto?.senderAmount32 / 100);
    const decimalPart = (this.app?.swiftApplicationDto?.senderAmount32 % 100).toString().padStart(2, '0');
    return `${this.separateNumberByThree(integerPart)},${decimalPart} ${this.app
      ?.swiftApplicationDto?.senderCurrency32}`;
  }

  getAmountBuy() {
    const integerPart = Math.floor(this.app?.conversionApplicationDto?.senderAmount / 100);
    const decimalPart = (this.app?.conversionApplicationDto?.senderAmount % 100).toString().padStart(2, '0');
    return `${this.separateNumberByThree(integerPart)},${decimalPart} ${this.app
      ?.conversionApplicationDto?.receiverCurrency}`;
  }

  getAmountSell() {
    const integerPart = Math.floor(this.app?.conversionApplicationDto?.senderAmount / 100);
    const decimalPart = (this.app?.conversionApplicationDto?.senderAmount % 100).toString().padStart(2, '0');
    return `${this.separateNumberByThree(integerPart)},${decimalPart} ${this.app
      ?.conversionApplicationDto?.senderCurrency}`;
  }

  getAmountCross() {
    const integerPart = Math.floor(this.app?.conversionApplicationDto?.senderAmount / 100);
    const decimalPart = (this.app?.conversionApplicationDto?.senderAmount % 100).toString().padStart(2, '0');
    return `${this.separateNumberByThree(integerPart)},${decimalPart} ${this.app
      ?.conversionApplicationDto?.senderCurrency}/${this.app?.conversionApplicationDto?.receiverCurrency}`;
  }
  separateNumberByThree(value: string | number): string {
    const strValue = value.toString();

    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  getSvgContent() {
    const type = this.getAppImageType();
    this.svgContent = `/assets/svg/${type}.svg`;
  }

  getAppImageType(): string {
    let res = '';
    switch (this.app?.applicationType) {
      case 'CONVERSION_CROSS':
        res = 'money-cross';
        break;
      case 'CONVERSION_BUY':
        res = 'money-buy';
        break;
      case 'CONVERSION_SELL':
        res = 'money-send';
        break;
      default:
        res = 'money-swift';
    }
    return res;
  }

  getApplicationTitle() {
    let res = '';
    switch (this.app?.applicationType) {
      case 'CONVERSION_CROSS':
        res = 'Конверсионные операции (СКВ на СКВ)';
        break;
      case 'CONVERSION_BUY':
        res = 'Заявка на покупку иностранной валюты';
        break;
      case 'CONVERSION_SELL':
        res = 'Заявка на продажу иностранной валюты';
        break;
      default:
        res = 'Заявка на перевод иностранной валюты';
    }
    return res;
  }


  getSubTitle() {
    let res = '';
    switch (this.app?.applicationType) {
      case 'CONVERSION_CROSS':
        res = 'СКВ на СКВ';
        break;
      case 'CONVERSION_BUY':
        res = 'Покупка';
        break;
      case 'CONVERSION_SELL':
        res = 'Продажа';
        break;
      default:
        res = 'SWIFT';
    }
    return res;
  }

  openDetail() {
    switch (this.app?.applicationType) {
      case 'CONVERSION_CROSS':
        this.openCrossConversionDetail();
        break;
      case 'CONVERSION_BUY':
        this.openCurrencyBuyDetail();
        break;
      case 'CONVERSION_SELL':
        this.openCurrencySellDetail();
        break;
      case 'SWIFT':
        this.openSwiftDetail();
        break;
      default:
        return;
    }
  }

  openSwiftDetail() {
    this.matDialog.open(SwiftDetailComponent, {
    width: '550px',
    height: '100%',
    position: {right: '0'},
    panelClass: 'right-side-dialog',
    data: this.app,
  }).afterClosed()
    .subscribe((res) => {
      if(res === 'update') {
        this.update.emit();
      }
    });
  }

  openCurrencyBuyDetail() {
    this.matDialog.open(ApplicationDetailComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: this.app,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.update.emit();
        }
      });
  }

  openCurrencySellDetail() {
    this.matDialog.open(ApplicationDetailComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: this.app,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.update.emit();
        }
      });
  }

  openCrossConversionDetail() {
    this.matDialog.open(AppInfoComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: this.app,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.update.emit();
        }
      });
  }

  protected readonly getStatusApplication = getStatusApplication;
}
