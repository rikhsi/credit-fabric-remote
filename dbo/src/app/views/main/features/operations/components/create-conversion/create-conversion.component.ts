import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  inject,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from "ngx-mask";
import { MatOption } from "@angular/material/autocomplete";
import { MatFormField, MatSelect } from "@angular/material/select";
import { UiSvgIconComponent } from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import { AccountsDto } from "../../../accounts-payments/models/accounts-payments.model";
import { AccountsPaymentsService } from "../../../accounts-payments/services/accounts-payments.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { take } from "rxjs";
import { UtilsService } from "../../../../../../core/services/utils.service";
import { OperationsService } from "../../services/operations.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { AdditionalInfoComponent } from '../../../../../../shared/components/additional-info/additional-info.component';
import { ConversionService } from '../../../../../../core/services/conversion.service';
import { AccountService } from '../../../../../../core/services/account.service';

@Component({
  selector: 'app-create-conversion',
  imports: [
    NgIf,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgClass,
    MatOption,
    MatSelect,
    UiSvgIconComponent,
    MatFormField,
    MatMenu,
    MatMenuTrigger,
    NgOptimizedImage,
    AdditionalInfoComponent
  ],
  templateUrl: './create-conversion.component.html',
  styles: `
    select {
      -webkit-appearance: none;
      appearance: none;
    }

    .payment-select {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #dbdbdb !important;
      }

      .mdc-text-field--outlined {
        --mdc-outlined-text-field-container-shape: 10px !important;
      }

      .mat-mdc-select-arrow {
        display: none;
      }

      .mat-mdc-form-field-flex {
        height: 44px;
        padding: 8px;
      }

      .mat-mdc-form-field-infix {
        padding-top: 16px;
        top: -15px;
      }

      .mat-mdc-select-placeholder,
      .mat-mdc-form-field-input-control,
      .mat-mdc-select-value-text {
        color: #000;
      }

      .mat-mdc-text-field-wrapper {
        padding: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CreateConversionComponent implements OnInit {
  form!: FormGroup;
  showCurrencyFields: boolean = false;
  accounts: AccountsDto[] | undefined;
  private fb = inject(FormBuilder);
  private cf = inject(ChangeDetectorRef);
  private _utilsService = inject(UtilsService);
  private _operationsService = inject(OperationsService);
  private _accountPaymentService = inject(AccountsPaymentsService);
  private _toast = inject(ToastrService);
  private _router = inject(Router);
  private templateService = inject(TemplateService);
  #destroy = inject(DestroyRef);
  private accountsPaymentService = inject(AccountsPaymentsService);
  private accountService = inject(AccountService);
  private conversionService = inject(ConversionService);

  ngOnInit(): void {
    this.form = this.fb.group({
      sender: ['', Validators.required],
      receiver: ['', Validators.required],
      specialAccount: ['', Validators.required],
      description: ['', Validators.required],
      clientCurrencyOfferRate: [''],
      clientCurrencyOfferAmount: [''],
      senderAmount: ['', Validators.required],
      attachedFiles: this.fb.array([]),
    });
    this.form.get('senderAmount')?.valueChanges.subscribe(value => {
      this.showCurrencyFields = value >= 50000;
    });
    this.getAccountsList()
  }

  download = {
    conversion_oferta_uz: {
      title: 'Оферта UZ',
      id: 'conversion_oferta_uz',
    },
    conversion_oferta_ru: {
      title: 'Оферта RU',
      id: 'conversion_oferta_ru',
    },
    conversion_oferta_en: {
      title: 'Оферта EN',
      id: 'conversion_oferta_en',
    }
  }

  getAccountsList() {
    this.accountService.getAccountList({
      page: 0,
      size: 100
    }, {}).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
      this.cf.detectChanges()
    })
  }

  checkPaymentAllowed() {
    const form = this.form.getRawValue();
    const data = {
      senderAccount: form.sender,
      recipientAccount: form.receiver,
      transactionMode: 'CONVERSION'
    }
    this.accountsPaymentService.checkPaymentAllowed(data)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {
          this.onSubmit();
        }
      })
  }
  onSubmit() {
    if (this.form.valid) {
      this._utilsService.spinnerState$$.next(true)
      const senderAmount = this.form.value.senderAmount * 100
      const clientCurrencyOfferAmount = this.form.value.clientCurrencyOfferAmount * 100
      this._operationsService.createConversion({
        attachedFiles: this.form.value.attachedFiles,
        description: this.form.value.description,
        specialAccount: this.form.value.specialAccount,
        senderAmount: senderAmount,
        receiver: this.form.value.receiver,
        clientCurrencyOfferRate: this.form.value.clientCurrencyOfferRate,
        sender: this.form.value.sender,
        clientCurrencyOfferAmount: clientCurrencyOfferAmount
      }).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (!res) return
        this._toast.success(res.msg)
        this._router.navigate(['/operations']).then(() => { })
      });
    }
  }

  doSomething() {
    this.conversionService.getConversionIdn().
      pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {

      })
  }

  getOfferUrl() {
    this.accountsPaymentService.getOfferUrl('SWIFT_CORRESPONDENT_BANKS')
  }

  addDocument() {
    this.documentList.push(this.fb.control(''));
  }

  removeDocument(index: number) {
    this.documentList.removeAt(index);
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this._utilsService.spinnerState$$.next(true)
      this._accountPaymentService.fileUpload(file).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (!res) return
        this.documentList.at(index).setValue(res?.downloadUrl);
        this.cf.detectChanges()

      });
    }
  }

  get documentList() {
    return this.form.get('attachedFiles') as FormArray;
  }


  async printOfertaRu(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/conversion-oferta-ru.mustache',
      templateData: {
        sender: data.conversionApplicationDto?.sender,
        senderAmount: data.conversionApplicationDto?.senderAmount,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU'),
      },
      templateName: 'conversion-oferta'
    };
    await this.templateService.showPdfInDialog(options);
  }

  async printOfertaUz(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/conversion-oferta-uz.mustache',
      templateData: {
        sender: data.conversionApplicationDto?.sender,
        senderAmount: data.conversionApplicationDto?.senderAmount,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU'),
      },
      templateName: 'conversion-oferta'
    };
    await this.templateService.showPdfInDialog(options);
  }

  async printOfertaEn(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/conversion-oferta-en.mustache',
      templateData: {
        sender: data.conversionApplicationDto?.sender,
        senderAmount: data.conversionApplicationDto?.senderAmount,
        senderCurrency: data.conversionApplicationDto?.senderCurrency,
        receiver: data.conversionApplicationDto?.receiver,
        receiverCurrency: data.conversionApplicationDto?.receiverCurrency,
        bankCode: data.conversionApplicationDto?.bankCode,
        date: new Date(data.createdDate).toLocaleString('ru-RU'),
      },
      templateName: 'conversion-oferta'
    };
    await this.templateService.showPdfInDialog(options);
  }

}
