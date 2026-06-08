import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {NgxMaskPipe} from "ngx-mask";
import {UiSvgIconComponent} from "../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatIcon} from "@angular/material/icon";
import {MatRipple} from "@angular/material/core";
import {RouterLink} from "@angular/router";
import { AccreditService } from '../../../../core/services/accredit.service';
import { AccreditItem } from './models/letter-of-credit.model';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { KartotekaDetailsComponent } from '../kartoteka-old/components/kartoteka-details/kartoteka-details.component';
import { MatDialog } from '@angular/material/dialog';
import { LettersDetailsComponent } from './components/letters-details/letters-details.component';
import { Options, TemplateService } from '../../../../core/services/template.service';
import { FilterButtonComponent } from '../../../../shared/components/common/filter-button/filter-button.component';

@Component({
    selector: 'app-letters-of-credit',
    imports: [
        MatMenu,
        NgxMaskPipe,
        UiSvgIconComponent,
        MatMenuTrigger,
        MatIcon,
        MatRipple,
        RouterLink,
        DecimalPipe,
        NgOptimizedImage,
        NgClass,
        MatTooltip,
        FilterButtonComponent
    ],
    templateUrl: './letters-of-credit.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LettersOfCreditComponent implements OnInit {
  accreditList: AccreditItem[] = [];
  isLoading = false;
  filterState = false;

  constructor(
    private accreditService: AccreditService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private matDialog: MatDialog,
    private templateService: TemplateService,
  ) {
  }
  ngOnInit(): void {
    this.getAccreditList();
  }

  getAccreditList() {
    this.accreditService.getAccreditList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.accreditList = val.map(el => {
            if(el.state.toLowerCase() == "1") {
              el.state = 'Активный';
            } {
              el.state = 'Неактивный';
            }
            return el;
          })
          this._cdRef.markForCheck();
        }
      })
  }

  async printAccreditivDetailsPdf() {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/accredit-list.mustache',
      templateData: {
        accreditList: this.accreditList
      },
      templateName: 'accredit-list'
    };
    await this.templateService.showPdfInDialog(options);
  }

  getFormattedAmount(amount: string) {
    const digits = amount.slice(0, -2);
    const res = amount.slice(-2)
  }

  openDetails(accredit: AccreditItem) {
    this.matDialog.open(LettersDetailsComponent, {
      data: { accredit },
      width: '400px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    })
  }

  formatNumber(value: string): string {
    const number = parseFloat(value);
    return number.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  protected readonly Number = Number;
}
