import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatOption, MatRipple } from '@angular/material/core';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { LettersOfCreditService } from '../../services/letters-of-credit.service';
import { ToastrService } from 'ngx-toastr';
import { CreateAccredit } from '../../models/letter-of-credit.model';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { MatLabel, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { FileLoaderComponent } from '../../../../../../shared/components/file-loader/file-loader.component';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';

@Component({
    selector: 'app-create-letters-of-credit',
    imports: [
        RouterLink,
        MatRipple,
        NgOptimizedImage,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInput,
        MatLabel,
        NgIf,
        NgForOf,
        MatButton,
        NgClass,
        ContainerTitleComponent,
        ContainerNavComponent,
        NgxMaskDirective,
        MatOption,
        MatIcon,
        MatSelect,
        FileLoaderComponent,
        LocationBackDirective
    ],
    templateUrl: './create-letters-of-credit.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateLettersOfCreditComponent implements OnInit {
  title = 'Создать заявку на открытие';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Аккредитивы',
      link: '/letters-of-credit'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  currencies: any[] = [];

  accreditForm = new FormGroup({
    amount: new FormControl('', [Validators.required]),
    currency: new FormControl('', [Validators.required]),
    attachment1: new FormControl('', [Validators.required]),
    attachment2: new FormControl('', [Validators.required]),
    attachment3: new FormControl('', [Validators.required]),
  });

  constructor(
    private destroyRef: DestroyRef,
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private accreditService: LettersOfCreditService,
    private toastrService: ToastrService,
    private utilsService: UtilsService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.getCurrencies();
  }

  getCurrencies() {
    this.accountsPaymentsService.getCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res) {
            this.currencies = res;
            this._cdRef.markForCheck();
          }
        }
      });
  }

  updateAttachment(downloadUrl: any, fieldName: string) {
    this.accreditForm.patchValue({
      [fieldName]: downloadUrl
    });
  }

  isTouched(fieldName: string) {
    return !!(this.accreditForm.get(fieldName)?.invalid && this.accreditForm.get(fieldName)?.touched)
  }

  submit() {
    this.accreditForm.markAllAsTouched();
    if(this.accreditForm.invalid) {
      this._cdRef.markForCheck();
      return;
    }

    this.utilsService.spinnerState$$.next(true);

    const payload = this.accreditForm.getRawValue() as unknown as CreateAccredit;
    payload.amount = `${+payload.amount * 100}`;

    this.accreditService.createAccredit(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.utilsService.spinnerState$$.next(false);
          if(!res) return;
          console.log('res', res);
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.message || 'Что-то пошло не так!');
        }
      });
  }
}
