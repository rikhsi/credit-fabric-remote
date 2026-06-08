import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect, MatSelectTrigger } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { mergeMap, of, Subject, takeUntil } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { UtilsService } from 'src/app/core/services/utils.service';

import { MyOfficeService } from '../../service/my-office.service';
import { ParamsDto, RegionsDto, ServiceOneDto, SubCategoryDto } from '../../types/my-office.model';
import { MyOfficeItem, PaymentNavItem } from '../../types/my-office.type';

@Component({
    selector: 'app-add-service',
    imports: [
        CommonModule,
        MatIcon,
        MatProgressSpinner,
        ReactiveFormsModule,
        MatFormField,
        MatSelect,
        MatOption,
        UiSvgIconComponent,
        NgOptimizedImage,
        MatSelectTrigger,
    ],
    templateUrl: './add-service.component.html',
    styles: `
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

        .mat-mdc-form-field-icon-suffix {
          width: 40px;
        }

        .mat-mdc-text-field-wrapper {
          padding: 0;
        }
        .mat-mdc-select-arrow-wrapper {
          display: none;
        }

  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AddServiceComponent implements OnInit, OnDestroy {
  private unsub$ = new Subject<void>();

  parentParamsList: ParamsDto[] = []
  childrenParamsList: ParamsDto[] = []
  inputParamsList: ParamsDto[] = []
  subCategories: SubCategoryDto[] = [];
  serviceOneResult!: ServiceOneDto;
  addServiceForm!: FormGroup;
  selectedCategory!: any;
  selectedSubCategory!: any;
  constructor(
    public _dialogRef: MatDialogRef<AddServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: PaymentNavItem[], office: MyOfficeItem },
    private myOfficeService: MyOfficeService,
    private fb: FormBuilder,
    private cf: ChangeDetectorRef,
    private toastrService: ToastrService,
    private utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.addServiceForm = this.fb.group({ uuid: [null, [Validators.required]] })
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  getSubCategory(item: any) {
    this.selectedCategory = item;
    const parent = item.uuid;
    this.utilsService.spinnerState$$.next(true);
    this.inputParamsList = this.parentParamsList = this.childrenParamsList = this.subCategories = [];
    Object.keys(this.addServiceForm.controls).forEach(control => control !== 'uuid' ? this.addServiceForm.removeControl(control) : null);
    this.addServiceForm.controls['uuid'].reset();
    this.myOfficeService.getSubcategory(parent).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return;
      this.subCategories = res.categories;
    });
    this.cf.markForCheck();
  }

  getImageUrl(logo: any) {
    if(!logo) return 'asd';
    return `${logo.path}/${logo.name}.${logo.ext}`;
  }

  getServiceOne(item: any) {
    this.selectedSubCategory = item;
    const uuid = item.uuid;
    this.utilsService.spinnerState$$.next(true);
    Object.keys(this.addServiceForm.controls).forEach(control => control !== 'uuid' ? this.addServiceForm.removeControl(control) : null);
    this.myOfficeService.getServiceOne(uuid).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return;
      this.parentParamsList = res.params.filter(param => !param.bind && param.type === 'SELECT');
      this.childrenParamsList = res.params.filter(param => param.bind && param.type === 'SELECT');
      this.inputParamsList = res.params.filter(param => param.type !== 'SELECT');
      res.params.forEach(param => this.addServiceForm.addControl(param.uuid, new FormControl(null, Validators.required)));
      this.cf.markForCheck();
    });
  }

  onParentChange(region: RegionsDto, uuid: string) {
    this.inputParamsList.forEach(param => this.addServiceForm.controls[param.uuid].reset());
    if (!this.childrenParamsList.length) return;

    this.childrenParamsList = this.childrenParamsList.map(param => {
      this.addServiceForm.controls[param.uuid].reset();
      if (param.bind !== uuid) return param;
      param.selectValue = region.children;
      return param;
    })
  }

  onChildrenChange() {
    this.inputParamsList.forEach(param => this.addServiceForm.controls[param.uuid].reset());
  }

  onSubmit() {
    if (this.addServiceForm.invalid) return;
    this.utilsService.spinnerState$$.next(true);

    const uuid = this.addServiceForm.controls['uuid'].value;
    const params: any = [...this.parentParamsList, ...this.childrenParamsList, ...this.inputParamsList].map(param => {
      return {
        id: param.id,
        key: '',
        value: param.type === 'SELECT' ? this.addServiceForm.controls[param.uuid].value.value : this.addServiceForm.controls[param.uuid].value,
        uuid: param.uuid,
      }
    })

    this.myOfficeService.paynetCheck({ uuid: uuid.uuid, params }).pipe(takeUntil(this.unsub$), mergeMap(res => {
      if(!res) return of(null);
      let addServicePayload: any = {
        myOffice: { id: this.data.office.uuid },
        service: { id: uuid.uuid },
        params,
        title: 'test'
      };
      this.utilsService.spinnerState$$.next(true);
      return this.myOfficeService.addService(addServicePayload);
    })).subscribe(res => {
      if (!res) return;
      this.toastrService.success('Succesfully added')
      this._dialogRef.close()
    });
  }
}
