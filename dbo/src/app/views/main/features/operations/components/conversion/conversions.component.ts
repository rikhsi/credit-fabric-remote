import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {MatPaginator} from "@angular/material/paginator";
import {NgxMaskPipe} from "ngx-mask";
import {MatIcon} from "@angular/material/icon";
import { MatOption, MatRipple } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatTooltip} from "@angular/material/tooltip";
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { ApplicationItem } from '../../../applications/models/applications.model';
import {getRussianFormattedDate, getStatusApplication, getStepsApplication} from "../../../../../../core/utils/mixin.utils";
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { Options, TemplateService } from '../../../../../../core/services/template.service';

@Component({
    selector: 'app-operations',
    imports: [
        MatMenu,
        MatPaginator,
        NgxMaskPipe,
        UiSvgIconComponent,
        MatIcon,
        MatRipple,
        RouterLink,
        NgClass,
        MatTooltip,
        NgIf,
        MatOption,
        MatSelect,
        ReactiveFormsModule,
        MatMenuTrigger
    ],
    providers: [DatePipe],
    templateUrl: './conversions.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionsComponent implements OnInit {
  #destroy = inject(DestroyRef)
  isFetching = false
  private _cf = inject(ChangeDetectorRef)
  private _applicationService = inject(ApplicationsService)
  accountApplications: ApplicationItem[] = [];

  download = {
    conversion_application: {
        title: 'Заявление на осуществление конверсии',
        id: 'conversion_application',
    },
    buy_currency: {
      title: 'Заявления на покупку валюты',
      id: 'buy_currency',
    },
    sell_currency: {
      title: 'Заявление на продажу валюты',
      id: 'sell_currency',
    },
  }

  constructor(
    private _matDialog: MatDialog,
    private templateService: TemplateService,
    ) {
  }

  async ngOnInit(): Promise<void> {
    this.getApplicationsList();
  }

  async printConversionApplication(data: ApplicationItem) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/conversion-application.mustache',
      templateData: {
        sender: data.conversionApplicationDto?.sender,
        senderAmount: data.conversionApplicationDto?.senderAmount,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU'),
      },
      templateName: 'conversion-application'
    };
    await this.templateService.showPdfInDialog(options);
  }

  async printBuyCurrency(data: ApplicationItem) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/buy-currency.mustache',
      templateData: {
        ...data,
        sender: data.conversionApplicationDto?.sender,
        senderAmount: Number(data.conversionApplicationDto?.senderAmount) / 100,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      },
      templateName: 'buy-currency'
    };
    await this.templateService.showPdfInDialog(options);
  }

  async printSellCurrency(data: ApplicationItem) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/sell-currency.mustache',
      templateData: {
        ...data,
        sender: data.conversionApplicationDto?.sender,
        senderAmount: Number(data.conversionApplicationDto?.senderAmount) / 100,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU'),
      },
      templateName: 'sell-currency'
    };
    await this.templateService.showPdfInDialog(options);
  }

  onDownloadReference(fileName: string) {
    const pdfPath = 'assets/pdf/' + fileName;
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = fileName;
    link.click();
  }

  sign(id: string | number) {
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: { applicationId: id },
    });
  }

  getApplicationsList() {
    this.isFetching = true
    this._applicationService.getApplications({
      pageSize: 20,
      pageNum: 0,
      sender: null,
      receiver: null,
      dateFrom: null,
      dateTo: null,
      amountFrom: null,
      amountTo: null,
      docNum: null,
      currency: null,
      searchText: '',
      applicationTypes: ['CONVERSION_CROSS'],
    })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
      if (!res) return
      // this.accountApplications = res.content
      this.isFetching = false
      this._cf.detectChanges()
    })
  }







  getSliceDescription(description: string | undefined): string {

    if (description!.length >= 200) {
      const result = description!.slice(0, 200)
      return result + '...'
    } else {
      return description ? description : ''
    }
  }

  protected readonly getRussianFormattedDate = getRussianFormattedDate;
  protected readonly getStatusApplication = getStatusApplication;
  protected readonly getStepsApplication = getStepsApplication;
}
