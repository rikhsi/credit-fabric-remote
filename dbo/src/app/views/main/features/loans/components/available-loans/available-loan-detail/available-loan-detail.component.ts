import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { UtilsService } from 'src/app/core/services/utils.service';

import { ILoanProduct, LoanDto } from '../../../models/loan.model';
import { LoanService } from '../../../services/loan.service';
import { ApplyLoanComponent } from '../apply-loan/apply-loan.component';
import {NgxMaskPipe} from "ngx-mask";
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
  ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import { strict } from 'node:assert';
import { AmountService } from '../../../../../../../core/services/amount.service';
import { LoanHeaderComponent } from '../../../../../../../shared/components/loan-header/loan-header.component';

@Component({
    selector: 'app-available-loan-detail',
    imports: [CommonModule, MatRippleModule, MatTabsModule, UiSvgIconComponent, NgxMaskPipe, ContainerNavComponent, ContainerTitleComponent, RouterLink, NgOptimizedImage, LoanHeaderComponent],
    templateUrl: './available-loan-detail.component.html',
    styles: [
        `
      .active {
        background: #264796;
        color: white;

      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ transform: 'translateX(+100%)' }),
                animate('400ms ease-in', style({ transform: 'translateX(0%)' })),
            ]),
        ]),
    ]
})
export class AvailableLoanDetailComponent implements OnInit {
  loan!: ILoanProduct;
  title = 'Легкий кредит для развития бизнеса';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Доступные кредиты',
      link: '/loans/available-loans'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  viewMode = 'about';

  fequencyMap: { [key: string]: string } = {
    'MONTHLY': 'Ежемесячно',
    'YEARLY': 'Ежегодно',
    'WEEKLY': 'Еженедельно',
  }


  constructor(
    private route: ActivatedRoute,
    private loanService: LoanService,
    private cf: ChangeDetectorRef,
    private utilsService: UtilsService,
    public amountService: AmountService,
  ) {
    this.utilsService.spinnerState$$.next(true);
  }

  ngOnInit(): void {
    this.initLoan();
  }

  getPerentages() {
    let arr: any[] = [];
    for(const key in this.loan?.persentageMap) {
      let obj: any = {
        month: key,
        percent: this.loan?.persentageMap[key],
        currency: this.loan?.persentageCurrencyMap[key],
      };
      arr.push(obj);
    }
    return arr;
  }

  separateAmount(data: any) {
    return this.amountService.separateNumberByThree(data);
  }

  initLoan() {
    const id = this.route.snapshot.params['id'];
    this.loanService.getLoanInfo(id).pipe(take(1)).subscribe((loan) => {
      if (!loan) return;
      this.loan = loan;
      this.cf.markForCheck();
    });
  }

  getFileSize(size: number): string {
    if (size === 0) {
      return '0 Bytes';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));

    const readableSize = (size / Math.pow(1024, i)).toFixed(2);

    return `${readableSize} ${units[i]}`;
  }

  getFileType(type: string): string {
    if (!type) {
      return 'Unknown';
    }

    const fileExtension = type.split('/').pop()?.toLowerCase() as string;

    // Map of common file types
    const fileTypesMap: { [key: string]: string } = {
      pdf: 'PDF',
      doc: 'DOC',
      docx: 'DOCX',
      txt: 'Text File',
      xls: 'Excel File',
      xlsx: 'Excel File',
      ppt: 'PowerPoint File',
      pptx: 'PowerPoint File',
      jpg: 'Image File',
      jpeg: 'Image File',
      png: 'Image File',
      gif: 'Image File',
      zip: 'Compressed File',
      rar: 'Compressed File',
    };

    return fileTypesMap[fileExtension] || 'Unknown File Type';
  }


}
