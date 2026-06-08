import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {PaymentService} from "../../../../../../../../../core/services/payment.service";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {ThemeService} from "../../../../../../../../../shared/services/theme.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  MunisCategoryListDto,
  ServiceDTO,
  ServiceParam
} from "../../../../../../accounts-payments/models/accounts-payments.model";
import {MatDivider} from "@angular/material/divider";
import {CreateOfficeModalComponent} from "../../modals/create-office-modal/create-office-modal.component";
import {UtilsService} from "../../../../../../../../../core/services/utils.service";

@Component({
  selector: 'app-child-services-choose-create',
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, MatDivider, NgOptimizedImage, CreateOfficeModalComponent],
  templateUrl: './child-services-choose.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateMyOfficeChooseChildServiceComponent implements OnInit {

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private destroyRef=  inject(DestroyRef);
  private toast=  inject(ToastrService);
  private utilsService = inject(UtilsService)



  inputSubject = new Subject<any>();
  skeletons = Array.from({ length: 15 });

  searchText = signal<string>('');
  parentName = signal<string>('');
  serviceName = signal<string>('');
  serviceLogo = signal<string>('');
  serviceId = signal<string>('');
  recipientId = signal<string>('');
  recipientName = signal<string>('');
  loading = signal<boolean>(false);
  openCreateModal = signal<boolean>(false);

  categoryList = signal<MunisCategoryListDto[] | null>([]);
  paramsList = signal<ServiceParam[] | null>([]);
  selectedParamsService = signal<any>([]);
  serviceList = signal<ServiceDTO | null>(null);
  isSearching = signal<boolean>(false);
  searchData = signal<any>(null);
  searchValue = signal('');


  ngOnInit(): void {
    this.getServices();
    const parentName = this.route.snapshot.queryParamMap.get('parentName');
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    const serviceName = this.route.snapshot.queryParamMap.get('serviceName');
    const serviceLogo = this.route.snapshot.queryParamMap.get('serviceLogo');

    if (parentName && !serviceId) {
      this.parentName.set(parentName)
    } else if (parentName && serviceId ) {
      this.serviceId.set(serviceId);
      this.parentName.set('Редактирование');
      this.serviceName.set(serviceName as string);
      this.serviceLogo.set(serviceLogo as string);
      this.getParamsAndSet();
    }
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (val.target.value.length === 0) {
          return this.isSearching.set(false);
        }
        this.isSearching.set(true);
        this.searchValue.set(val.target.value);
        this.searchService(val.target.value)
      })
  }

  getServices() {
    this.loading.set(true);
    this.paymentService.getMunisServices({parentId: this.route.snapshot.queryParamMap.get('parentId')}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.categoryList.set(data.categories)
          this.loading.set(false);
        },
        error: error => {
          this.toast.error(error.message);
          this.loading.set(false);
        }
      })
  }

  searchService(text: string) {
    this.paymentService.searchServiceMunis({
      page: 0,
      size: 100,
      parentId: this.route.snapshot.queryParamMap.get('parentId'),
      query: text,
      type: 'PAYMENT_SERVICE'
    }).pipe().subscribe({
        next: (data: any) => {
          this.searchData.set(data.content);
        },
        error: (err) => {
          this.toast.error(err.message);
        },
      }
    )
  }

  highlight(text: string | null | undefined, query: string | null | undefined): string {
    if (!text) return '';
    const q = (query ?? '').trim();
    if (!q) return text;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<span class="hl">$1</span>');
  }

  navigateFromSearch(list: any) {
    if (list.type === "PAYMENT_CATEGORY") {
      this.router.navigate(["payment/transfer-to-munis/services"],{
        queryParams: {
          parentName: list.category.title,
          parentId: list.category.id
        }
      })
    } else if (list.type === "PAYMENT_SERVICE") {
      if (list.service.parent === null) {
        this.getParams(list.service.id)
      } else {
        this.getParams(list.service.parent.id);
        this.recipientId.set(list.service.id);
        this.recipientName.set(list.service.title);
      }
    }
  }


  getParamsAndSet() {
    this.utilsService.spinnerState$$.next(true);
    const parentId = this.route.snapshot.queryParamMap.get('parentId');
    const officeId = this.route.snapshot.queryParamMap.get('officeId');
    this.loading.set(false);
    this.paymentService.getOfficeServicesOne(officeId as string).pipe().subscribe({
      next: result => {
        this.selectedParamsService.set(result?.params)
        this.paymentService.getMunisServicesOne({id: parentId}).pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: data => {
              if (!data.hasChild) {
                this.paramsList.set(data.params)
              } else {
                this.serviceList.set(data)
              }
              this.utilsService.spinnerState$$.next(false);
              if ( this.selectedParamsService().length > 0) {
                this.openCreateModal.set(true);
              }
            },
            error: error => {
              this.toast.error(error.message);
              this.utilsService.spinnerState$$.next(false);
            }
          })
      },
      error: error => {

      }
    });

  }

  getParams(parentId: string) {
    this.utilsService.spinnerState$$.next(true);
    this.recipientId.set(parentId);
    this.paymentService.getMunisServicesOne({id: parentId}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (!data.hasChild) {
            this.paramsList.set(data.params)
          } else {
            this.serviceList.set(data)
          }
          this.utilsService.spinnerState$$.next(false);
          this.openCreateModal.set(true);
        },
        error: error => {
          this.toast.error(error.message);
          this.utilsService.spinnerState$$.next(false);
        }
      })

  }

  backClick() {
    this.router.navigate(['payment/transfer-to-munis']);
  }

  setParamList(params) {
    this.paramsList.set(params);
  }

  closeCreatModal() {
    this.openCreateModal.set(false);
    if (this.route.snapshot.queryParamMap.get('redirectUrl')) {
      this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('redirectUrl') as string)
    } else {
      this.router.navigate(['payment/transfer-to-munis']);
    }
  }
}
