import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
  ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {ActivatedRoute, Router} from "@angular/router";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {SalaryProjectService} from "../../../../../../../core/services/salary-project.service";
import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';

@Component({
    selector: 'app-corp-card-create',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        FormsModule,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        NgOptimizedImage,
        NgxMaskDirective,
        ReactiveFormsModule,
        NgClass,
        MatOption,
        MatSelect,
        MatSuffix
    ],
    templateUrl: './corp-card-create.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardCreateComponent implements OnInit{
  contractNumber = signal('')
  type = signal('')
  transitAccount = signal('')
  navs = computed(() =>
    [
      {
        title: 'Главная',
        link: '/'
      },

      {
        title: 'Корпоративные карты',
        link: '/corp-card-project/corp-cards'
      },
      {
        title: this.contractNumber(),
        link: `/corp-card-project/corp-cards/items/${this.transitAccount()}/${this.contractNumber()}/${this.type()}`
      },
      {
        title: `Выпустить новую корпоративную карту`,
        link: '/'
      },]);

  employees: any[] = [];
  isSelect = false;

  private _activatedRoute = inject(ActivatedRoute)
  private utilService = inject(UtilsService)
  private _salaryService = inject(SalaryProjectService)
  #destroy = inject(DestroyRef)
  private _router = inject(Router)
  private _toast = inject(ToastrService)
  createEmployeeCardForm = new FormGroup({
    passportSerial: new FormControl('', Validators.compose([Validators.min(2), Validators.min(2), Validators.required])),
    passportNumber: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
    cardType: new FormControl('', Validators.required),
    pinfl: new FormControl('', Validators.compose([Validators.min(14), Validators.min(14), Validators.required])),
    businessAccount: new FormControl(''),
    fio:new FormControl('',Validators.required),
    userType:new FormControl('CORPORATE',Validators.required)
  })

  ngOnInit(): void {
    this.watchRoute();
    this.getEmployees();
  }

  watchRoute() {
    this._activatedRoute.queryParams.subscribe((params) => {
      if (params) {
        if(params['contractNumber']) {
          this.contractNumber.set(params['contractNumber']);
        }
        if(params['transitAccount']) {
          this.transitAccount.set(params['transitAccount']);
          this.createEmployeeCardForm.patchValue({
            businessAccount: this.transitAccount()
          });
        }
        if(params['type']) {
          this.type.set(params['type']);
          this.createEmployeeCardForm.patchValue({
            cardType: params['type']
          });
        }
        if(params['select']) {
          this.isSelect = true;
        }
      }
    });
  }

  get passportValue(): string {
    return ((this.createEmployeeCardForm.get('passportSerial')?.value ?? '') + (this.createEmployeeCardForm.get('passportNumber')?.value ?? ''));
  }

  onInputChange(event: Event): void {
    let input = (event.target as HTMLInputElement).value;
    input = input.replace(/\s/g, '');
    const serial = input.substring(0, 2).toUpperCase();
    const number = input.substring(2).replace(/\D/g, '');

    this.createEmployeeCardForm.get('passportSerial')?.setValue(serial, {emitEvent: false});
    this.createEmployeeCardForm.get('passportNumber')?.setValue(number, {emitEvent: false});
  }


  selectProject(value: any) {
    this.createEmployeeCardForm.patchValue({
      cardType: value.type,
      businessAccount: value.transitAccount,
    });
    this.transitAccount.set(value.transitAccount);
    this.type.set(value.type);
    this.contractNumber.set(value.contractNumber);
  }

  getEmployees() {
    this._salaryService.getAllPayrollProjectGroupList(
      {
        page: 0,
        size: 100,
        userType: 'CORPORATE',
      }
    ).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res: any) => {
        if (!res && !res.content) return;
        this.employees = res.content;
        console.log(this.employees);
      }
    )
  }

  createEmployeeCard(type = 'SAVE') {
    if (this.createEmployeeCardForm.valid) {
      this.utilService.spinnerState$$.next(true)
      const phone = this.replaceSpaces(this.phoneNumber?.value)
      this._salaryService.addEmployees({
        passportSerial: this.createEmployeeCardForm.value.passportSerial,
        passportNumber: this.createEmployeeCardForm.value.passportNumber,
        birthday: this.createEmployeeCardForm.value.birthday,
        cardType: this.createEmployeeCardForm.value.cardType,
        businessAccount: this.createEmployeeCardForm.value.businessAccount,
        pinfl:this.createEmployeeCardForm.value.pinfl,
        phoneNumber: phone,
        fio:this.createEmployeeCardForm.value.fio,
        userType:this.createEmployeeCardForm.value.userType
      }).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res => {
        if (!res) return
        this._toast.success(`Успешно`)
        this._router.navigate([`/corp-card-project/corp-pending-cards`])
        if(type === 'SAVE') {

        } else if (type === 'SEND') {
        }
      }))
    }
  }

  get phoneNumber() {
    return this.createEmployeeCardForm.get('phoneNumber') as AbstractControl
  }

  replaceSpaces(value: string) {
    return value.replaceAll(' ', '')
  }
}
