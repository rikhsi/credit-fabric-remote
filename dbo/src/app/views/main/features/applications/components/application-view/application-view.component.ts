import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {ApplicationItem} from "../../models/applications.model";
import { DatePipe, NgClass, NgIf } from '@angular/common';
import {MatDivider} from "@angular/material/divider";
import {
  getRussianFormattedDate,
  getStatusApplication,
  getStepsApplication
} from "../../../../../../core/utils/mixin.utils";
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';


@Component({
    selector: 'app-application-view',
    imports: [
        NgClass,
        MatDivider,
        DatePipe,
        MatIcon,
        NgIf,
        MatMenu,
        MatMenuTrigger,
        MatTooltip,
    ],
    templateUrl: './application-view.component.html',
    styles: ``,
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationViewComponent {
  @Input() data: ApplicationItem | undefined;
  @Input() applicationType!: string;

  constructor(
    private _matDialog: MatDialog,
    private templateService: TemplateService,
  ) {
  }


  sign(id: string | number | undefined) {
    if(!id) return;
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: { applicationId: id },
    });
  }

  printPdf(data: any) {
    if(data.applicationType === 'CREATE_ACCOUNT') {
      this.printOpenAccPdf(data);
    } else {
      this.printCloseAccPdf(data);
    }
  }

  async printOpenAccPdf(data: any) {
    const options: Options = {
      templateLang: 'ru',
      // templateLogo: './assets/images/stamp.jpg',
      templatePath: '/open-acc.mustache',
      templateData: {
        ...data,
        date: new Date(data.createdDate).toLocaleString('ru-Ru', { year: 'numeric', day: 'numeric', month: 'long' })
      },
      templateName: 'open-acc'
    };
    await this.templateService.showPdfInDialog(options);
  }

  async printCloseAccPdf(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/close-acc.mustache',
      templateData: {
        ...data,
        date: new Date(data.createdDate).toLocaleString('ru-Ru', { year: 'numeric', day: 'numeric', month: 'numeric' })
      },
      templateName: 'close-acc'
    };
    await this.templateService.showPdfInDialog(options);
  }

  protected readonly getStatusApplication = getStatusApplication;
  protected readonly getRussianFormattedDate = getRussianFormattedDate;
  protected readonly getStepsApplication = getStepsApplication;
}
