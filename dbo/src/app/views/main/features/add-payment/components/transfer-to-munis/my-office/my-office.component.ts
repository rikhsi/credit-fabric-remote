import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {of, Subject} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {MatDivider} from "@angular/material/divider";
import {ThemeService} from "../../../../../../../shared/services/theme.service";
import {PaymentService} from "../../../../../../../core/services/payment.service";
import {MunisListItem, OfficeServices} from "../../../../accounts-payments/models/accounts-payments.model";
import {DeleteOfficeModalComponent} from "./modals/delete-office-modal/delete-office-modal.component";
import {CreateTitleModalComponent} from "./modals/create-title-modal/create-title-modal.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-my-office',
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, NgOptimizedImage, MatDivider, DeleteOfficeModalComponent, CreateTitleModalComponent, MatMenu, MatMenuTrigger],
  templateUrl: './my-office.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyOfficeComponent implements OnInit {

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private toast=  inject(ToastrService);
  private utilService=  inject(UtilsService);
  public translate =  inject(TranslateService)



  inputSubject = new Subject<any>();
  skeletons = Array.from({ length: 4 });

  searchText = signal<string>('');
  officeId = signal<string>('');
  serviceId = signal<{  id: string, name: string, parentName: string, parentId: string, logo: string, officeId: string  }>({
    id: '',
    name: '',
    parentName: '',
    parentId: '',
    logo: '',
    officeId: ''
  });
  officeName = signal<string>('');
  data = signal<MunisListItem | Record<string, any>>({});
  servicesList = signal<OfficeServices[] | null>([]);
  loading = signal<boolean>(false);
  deleteModal = signal<boolean>(false);
  deleteModalService = signal<boolean>(false);
  editModal = signal<boolean>(false);

  currentMonth = signal('');
  prevMonth = signal('');

  ngOnInit(): void {
    const now = new Date();

    this.currentMonth.set(now.toLocaleString('ru-RU', { month: 'long' }));

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);
    this.prevMonth.set(prevDate.toLocaleString('ru-RU', { month: 'long' }))

    const office =  localStorage.getItem("office");
    if (office) {
      this.data.set(JSON.parse(office))
      this.officeName.set(JSON.parse(office)?.name)
    }
    if (this.route.snapshot.queryParamMap.get('id')) {
      this.officeId.set(this.route.snapshot.queryParamMap.get('id') as string)
      this.getMunisOfficeServices(this.route.snapshot.queryParamMap.get('id') as string);
    }
    this.paymentService.getMyOffice().pipe().subscribe({
      next: data => {
        const office =  data?.find(item => item.uuid === this.route.snapshot.queryParamMap.get('id'))
        if (office) {
          this.data.set(office);
          this.officeName.set(office?.name)
        }
      },
    })
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  getMunisOfficeServices(id: string) {
    this.loading.set(true);
    this.paymentService.getMyOfficeServices({
      page: 0,
      size: 100,
      officeId: id,
    }).pipe().subscribe({
      next: data => {
        if (data) {
          this.loading.set(false);
          this.servicesList.set(data.content)
        }
      },
      error: error => {
        this.loading.set(false);
        this.toast.error(error.message);
      }
    })
  }

  deleteOfficeService() {
    this.utilService.spinnerState$$.next(true);
    this.paymentService.deleteMyOfficeService({ id: this.serviceId().officeId }).pipe().subscribe({
      next: () => {
        this.toast.success(this.serviceId().name, this.translate.instant('createPayment.deleted'));
        this.deleteModalService.set(false);
        this.utilService.spinnerState$$.next(false);
        this.getMunisOfficeServices(this.route.snapshot.queryParamMap.get('id') as string);
      },
      error: error => {
        this.toast.error(error.message);
      }
    })
  }

  redirectToEditMyOfficeService() {
    this.router.navigate(['payment/transfer-to-munis/create-my-office/services'], {
      queryParams: {
        officeId: this.serviceId().officeId,
        serviceId: this.serviceId().id,
        serviceName: this.serviceId().name,
        parentName: this.serviceId().parentName,
        parentId: this.serviceId().parentId,
        serviceLogo: this.serviceId().logo,
        redirectUrl: this.router.url
      }
    });
  }

  navigateToCreateTransaction(serviceName: string, serviceId: string, parentId: string, parentName: string, officeId: string) {
    this.router.navigate(['payment/transfer-to-munis/create-transaction'],
      {queryParams: {
          serviceName: serviceName,
          serviceId: serviceId,
          parentId: parentId,
          childServiceId: parentId,
          childServiceName: parentName,
          redirectUrl: this.router.url,
          officeId: officeId,
        }
      });
  }


  deleteOffice() {
    this.utilService.spinnerState$$.next(true);
    this.paymentService.deleteMyOffice({ id: this.officeId() }).pipe().subscribe({
      next: () => {
        this.toast.success(this.data().name, this.translate.instant('createPayment.deleted'));
        this.router.navigate(['payment/transfer-to-munis'])
        this.utilService.spinnerState$$.next(false);
      },
      error: error => {
        this.toast.error(error.message);
      }
    })
  }

  editOffice() {
    this.utilService.spinnerState$$.next(true);
    this.paymentService.editMyOffice({ uuid: this.officeId(), name: this.officeName() }).pipe().subscribe({
      next: () => {
        this.paymentService.getMyOffice().pipe().subscribe({
          next: data => {
           const office =  data?.find(item => item.uuid === this.officeId())
            if (office) {
              this.data.set(office);
            }
          },
        })
        this.toast.success(this.translate.instant('createPayment.changes'), this.translate.instant('createPayment.new_name'));
        this.editModal.set(false);
        this.utilService.spinnerState$$.next(false);
      },
      error: () => {
        this.utilService.spinnerState$$.next(false);
        this.editModal.set(false);
      }
    })
  }

  addServiceToOffice() {
    this.router.navigate(["payment/transfer-to-munis/create-my-office"], {
      queryParams: {
        officeId: this.officeId(),
        redirectUrl: this.router.url
      }
    });
  }

  cancelDeleteModal() {
    this.deleteModal.set(false)
  }
   cancelDeleteServiceModal() {
    this.deleteModalService.set(false)
  }

  cancelEditModal() {
    this.editModal.set(false)
  }


  backClick() {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      replaceUrl: true
    });
  }

}
