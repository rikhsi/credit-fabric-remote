import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil} from 'rxjs';

import { NgFor, NgIf } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import {UiSvgIconComponent} from "../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {TransportService} from "../../../../../../../../core/services/transport.service";
import {ToastrService} from "ngx-toastr";
import {AutoInfoFormResponse, SelectValueType} from "../../../../types/transport.types";


@Component({
    selector: 'app-transport-info-form',
    templateUrl: './transport-info-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        NgFor,
        UiSvgIconComponent,
        NgxMaskDirective,
        TranslateModule
    ]
})
export class TransportInfoFormComponent implements OnInit {
  @Input() public title = '';
  @Input() public type = '';
  @Input() public id = '';
  @Output() public closeForm = new EventEmitter<void>();

  public isLoading = true;

  private _gasTypes: SelectValueType = [
    { value: 'METAN', label: 'transport.gas-metan' },
    { value: 'GBO3', label: 'transport.gas-gbo' },
    { value: 'PROPAN', label: 'transport.gas-propan' }
  ];
  private _tintTypes: SelectValueType = [
    { value: 'REAR_SIDE_WINDOWS', label: 'transport.backside-windows' },
    {
      value: 'REAR_AND_SIDE_WINDOWS',
      label: 'transport.front-and-backside-windows'
    }
  ];
  private _proxyTypes: SelectValueType = [
    { value: 'ONE_TIME', label: 'transport.one-time' },
    { value: 'SPECIAL', label: 'transport.special' },
    { value: 'GENERAL', label: 'transport.general' }
  ];

  public types: SelectValueType = [];

  public form: FormGroup = new FormGroup({});

  public get typeText(): string {
    let tintType, gasType, affidavitType;
    switch (this.title) {
      case 'tinting': {
        ({ tintType } = this._translate.instant('transport'));
        return tintType;
      }
      case 'gas': {
        ({ gasType } = this._translate.instant('transport'));
        return gasType;
      }
      case 'affidavit': {
        ({ affidavitType } = this._translate.instant('transport'));
        return affidavitType;
      }
      default:
        return '';
    }
  }
  private _destroy$ = new Subject<void>()
  public constructor(
    private _cdRef: ChangeDetectorRef,
    private _transport: TransportService,
    private _toastr: ToastrService,
    private _fb: FormBuilder,
    private _translate: TranslateService
  ) {}

  public ngOnInit(): void {
    switch (this.title) {
      case 'tinting':
        this.types = this._tintTypes;
        this.form = this._fb.group({
          type: ['', [Validators.required]],
          startDate: ['', [Validators.required, Validators.minLength(10)]],
          endDate: ['', [Validators.required, Validators.minLength(10)]]
        });
        break;
      case 'gas':
        this.types = this._gasTypes;
        this.form = this._fb.group({
          type: ['', [Validators.required]],
          startDate: ['', [Validators.required, Validators.minLength(10)]],
          endDate: ['', [Validators.required, Validators.minLength(10)]],
          gasStartDate: ['', [Validators.required, Validators.minLength(10)]],
          gasEndDate: ['', [Validators.required, Validators.minLength(10)]]
        });
        break;
      case 'affidavit':
        this.types = this._proxyTypes;
        this.form = this._fb.group({
          type: ['', [Validators.required]],
          startDate: ['', [Validators.required, Validators.minLength(10)]],
          endDate: ['', [Validators.required, Validators.minLength(10)]],
          fio: ['', [Validators.required]],
          sery: ['', [Validators.required]],
          number: ['', [Validators.required]]
        });
        break;
      case 'oil':
        this.form = this._fb.group({
          date: ['', [Validators.required, Validators.minLength(10)]],
          currentKm: ['', [Validators.required]],
          dailyKm: ['', [Validators.required]],
          oilKm: ['', [Validators.required]],
          oilBrand: ['', [Validators.required]]
        });
        break;
    }

    if (this.type === 'edit') {
      this.getInfo();
    } else {
      this.toggleLoading();
    }
  }

  private getInfo(): void {
    this.toggleLoading(true);
    const title = this.title === 'affidavit' ? 'proxy' : this.title;
    this._transport
      .getAutoInfo<AutoInfoFormResponse>(
        {
          uuid: this.id
        },
        title
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            if (this.title === 'oil') {
              this.form.patchValue({
                date: res.result.data.replacementDate,
                oilKm: res.result.data.oilWalkingKm,
                ...res.result.data
              });
            } else {
              this.form.patchValue(res.result.data);
            }
          } else if (res && !res.success) {
            this._toastr.error(res.result.message);
          }
          this.toggleLoading();
        },
        error: (err: HttpErrorResponse) => {
          this._toastr.error(err.message);
          this.toggleLoading();
        }
      });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.toggleLoading(true);
      for (const key in this.form.value) {
        this.form.value[key] = this.form.value[key].trim().replace(/\//g, '-');
      }
      const title = this.title === 'affidavit' ? 'proxy' : this.title;

      this._transport
        .postAutoInfo<any, any>(
          {
            autoId: this.id,
            type: this.form.value.type,
            ...this.form.value
          },
          this.type,
          title
        )
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res && res.success) {
              const { success } = this._translate.instant('status');
              this._toastr.success(success);
              this._transport.refetchTransport.next(true);
              this.closeForm.emit();
            } else if (res && !res.success) {
              this._toastr.error(res.result.message);
            }
            this.toggleLoading();
          },
          error: (err: HttpErrorResponse) => {
            this._toastr.error(err.message);
            this.toggleLoading();
          }
        });
    }
  }

  private toggleLoading(status = false): void {
    this.isLoading = status;
    this._cdRef.detectChanges();
  }
}
