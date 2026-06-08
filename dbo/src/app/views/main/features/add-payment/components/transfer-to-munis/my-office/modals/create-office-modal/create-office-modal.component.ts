import {
  ChangeDetectionStrategy,
  Component, DestroyRef,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2, signal
} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {
  CheckServicePayload,
  ServiceDTO,
  ServiceParam
} from "../../../../../../accounts-payments/models/accounts-payments.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {PaymentService} from "../../../../../../../../../core/services/payment.service";
import {ToastrService} from "ngx-toastr";
import {NgxMaskDirective} from "ngx-mask";
import {UtilsService} from "../../../../../../../../../core/services/utils.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-create-office-modal',
  imports: [
    NgIf,
    TranslateModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    MatDivider,
    NgxMaskDirective,
    NgForOf
  ],
  templateUrl: './create-office-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ],
})
export class CreateOfficeModalComponent implements OnInit {
  @Input() open = false;
  @Input() recipientId = '';
  @Input() recipientNameI = '';
  @Input() servicesList: ServiceDTO | null = null;
  @Input() paramsList: ServiceParam[] | null = [];
  @Input() officeUuid  = '';
  @Input() serviceId  = '';
  @Input() serviceName  = '';
  @Input() selectedParamsService: any  = [];

  // @Output() agree = new EventEmitter<void>();
  // @Output() setTitle = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() setParamList = new EventEmitter<any[]>();

  touchedParams = new Set<string>();

  private renderer = inject(Renderer2)
  private paymentService = inject(PaymentService)
  private destroyRef=  inject(DestroyRef);
  private toast = inject(ToastrService);
  private utilsService = inject(UtilsService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected translate = inject(TranslateService)

  recipientName = signal<string>('');
  recipientIdFromInput = signal<string>('');
  serviceChildError = signal<boolean>(false);
  openFindPurposes = signal<boolean>(false);
  selectId = signal<any>('');
  checkParams = signal<CheckServicePayload | null>(null);


  selectedParams = signal<Array<{
    id: string;
    value: string;
    prefix?: string,
    suffix?: string,
  }>>([]);

  ngOnChanges() {
    if (this.open) {
      this.renderer.addClass(document.body, 'no-scroll');
    } else {
      this.renderer.removeClass(document.body, 'no-scroll');
    }
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'no-scroll');
  }


  ngOnInit() {
    if (this.serviceId && this.selectedParamsService) {
      this.setChildService(this.serviceId, this.serviceName, true);
    }
    if (this.recipientId && this.recipientNameI) {
      this.setChildService(this.recipientId, this.recipientNameI, false, true)
    }
    // http://localhost:4200/payment/transfer-to-munis/create-my-office?officeId=9f387d42-f079-44d9-8079-be78f310429b
  }


  toggleDropdown() {
    this.openFindPurposes.set(!this.openFindPurposes());
  }

  onCancel() {
    this.cancel.emit();
  }

  submitButtonClick() {
    if (this.route.snapshot.queryParamMap.get('serviceId')) {
      this.editService()
    } else {
      this.onAgree()
    }
  }

  onAgree() {
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createOfficeService({
      params: this.selectedParams(),
      officeUuid: this.route.snapshot.queryParamMap.get('officeId') as string,
      serviceUuid: this.recipientIdFromInput()
    }).pipe().subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirectUrl');
        if (redirect) {
          const id = redirect.split("id=")[1]
          this.router.navigate(["payment/transfer-to-munis/my-office"], {
            queryParams: {
              id: id
            }
          })
        } else {
          this.router.navigate(["payment/transfer-to-munis"])
        }
        this.toast.success(this.translate.instant('createPayment.ready_to_use'), this.translate.instant('settings.success'))
        this.utilsService.spinnerState$$.next(false);
      },
      error: (error) => {
        this.toast.error(error.message);
        this.utilsService.spinnerState$$.next(false);
      }
    })
    // this.agree.emit();
  }

  getParamValue(paramId: string): string | null {
    return this.selectedParams().find(p => p.id === paramId)?.value ?? null;
  }


  setParamValue(paramId: string, value: string) {
    this.checkParams.set(null);
    const existing = this.selectedParams().find(p => p.id === paramId);

    if (existing) {
      existing.value = value?.replaceAll(' ', '');
    } else {
      this.selectedParams().push({ id: paramId, value: value.replaceAll(' ', '') });
    }
  }


  setParamValueToInput(param: ServiceParam) {
    return param.selectValue
      ?.find(v => v.value === this.getParamValue(param.id))
      ?.title ?? ''
  }

  isInvalid(param: any): boolean {
    if (!param.required) return false;

    const value = this.getParamValue(param.id);
    return this.touchedParams.has(param.id) && !value;
  }

  onSelect(paramId: string, option: any) {
    this.checkParams.set(null);
    this.touchedParams.add(paramId);
    this.setParamValue(paramId, option.value);
    const params = this.paramsList;
    const currentParam = params?.find(p => p.id === paramId);
    if (!currentParam) return;

    currentParam.value = option.value;
    this.updateBoundSelects(currentParam.id, option.children ?? []);
    this.selectId.set('');
  }

  updateBoundSelects(parentId: string, children: any[]) {
    this.paramsList?.forEach(param => {
      if (param.bind === parentId) {
        if (children?.length === 0) {
          this.removeParamValue(param.id)
        }
        param.selectValue = children;
        param.value = '';
      }
    });
  }

  validateAll(): boolean {
    this.paramsList?.forEach(param => {
      if (param.required) {
        this.touchedParams.add(param.id);
      }
    });

    return this.paramsList ? this.paramsList?.every(param => {
      if (!param.required) return true;
      return !!this.getParamValue(param.id);
    }) : true;
  }

  initParamsForEdit(saved: any) {
    if (this.paramsList) {
      const params = this.paramsList;
      const savedMap: any = new Map(saved.map((x: any) => [x.id, x.value]));

      params.forEach(p => {
        const v: any = savedMap.get(p.id);
        if (v !== undefined && v !== null) {
          p.value = v;
          this.setParamValue(p.id, v);
        } else {
          p.value = '';
          this.removeParamValue?.(p.id);
        }
      });

      params
        .filter(p => p.type === 'SELECT' && !p.bind)
        .forEach(rootSelect => {
          this.restoreSelectChain(rootSelect.id, savedMap);
        });
    }
  }

  private restoreSelectChain(parentId: string, savedMap: Map<string, any>) {
    if (this.paramsList) {
      const params = this.paramsList;
      const parent = params.find(p => p.id === parentId);
      if (!parent || parent.type !== 'SELECT') return;

      const parentValue = savedMap.get(parentId);
      if (!parentValue) {
        this.resetBoundParams(parentId);
        return;
      }

      const selectedOption: any = (parent.selectValue ?? []).find(opt => opt.value === parentValue);

      const childrenOptions = selectedOption?.children ?? [];

      params.forEach(childParam => {
        if (childParam.bind !== parentId) return;

        childParam.selectValue = childrenOptions;

        const childSavedValue = savedMap.get(childParam.id);
        if (childSavedValue) {
          childParam.value = childSavedValue;
          this.setParamValue(childParam.id, childSavedValue);
          this.restoreSelectChain(childParam.id, savedMap);
        } else {
          childParam.value = '';
          this.removeParamValue?.(childParam.id);
          this.resetBoundParams(childParam.id);
        }

        if (!childrenOptions || childrenOptions.length === 0) {
          childParam.value = '';
          this.removeParamValue?.(childParam.id);
        }
      });
    }
  }

  serviceCheck() {
    if (this.servicesList && this.servicesList?.hasChild) {
      if (!this.recipientIdFromInput()) {
        return this.serviceChildError.set(true);
      }
    } else {
      this.validateAll();
    }
    if (this.validateAll() && !this.serviceChildError()) {
      this.utilsService.spinnerState$$.next(true);
      this.paymentService.MunisServicesCheck({
        id: this.recipientIdFromInput(),
        params: this.selectedParams()
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            this.utilsService.spinnerState$$.next(false);
            this.checkParams.set(data)
          },
          error: error => {
            this.utilsService.spinnerState$$.next(false);
            this.toast.error(error.message);
          }
        })
    }
  }

  resetBoundParams(parentId: string) {
    this.paramsList?.forEach(param => {
      if (param.bind === parentId) {
        param.value = '';
        param.selectValue = [];
        this.resetBoundParams(param.id);
      }
    });
  }

  removeParamValue(paramId: string) {
    this.selectedParams.set(this.selectedParams().filter(
      p => p.id !== paramId
    ))
  }


  editService() {
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.editOfficeService({
        uuid: this.route.snapshot.queryParamMap.get('officeId') as string,
        params: this.selectedParams()
    }).pipe().subscribe({
      next: () => {
        this.utilsService.spinnerState$$.next(false);
        this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('redirectUrl') as string);
        this.toast.success(this.translate.instant('createPayment.info_updated'), this.translate.instant('createPayment.changes_success'))
      },
      error: error => {
        this.toast.error(error.message);
        this.utilsService.spinnerState$$.next(false);
      }
    })
  }

  setChildService(serviceId: string, serviceName: string, fromOffice?: boolean, search?: boolean) {
    if (serviceId === this.recipientId && !search) {
      return
    }
    this.recipientIdFromInput.set(serviceId)
    if (!fromOffice) {
      this.setParamList.emit([]);
      this.selectedParams.set([]);
    }
    this.touchedParams.clear();
    this.recipientName.set(serviceName);
    this.paymentService.getMunisServicesOne({id: serviceId}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.setParamList.emit(data.params);
          if (fromOffice) {
            setTimeout(() => {
              this.initParamsForEdit(this.selectedParamsService);
            }, 1000)
            setTimeout(() => {
              this.serviceCheck()
            }, 2000)
          }
        },
        error: error => {
          this.toast.error(error.message);
        }
      })
    this.serviceChildError.set(false);
    // this._cdRef.detectChanges();
  }

  protected readonly Math = Math;
}
