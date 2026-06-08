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
import {ThemeService} from "../../../../../../shared/services/theme.service";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {PaymentService} from "../../../../../../core/services/payment.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MunisCategoryListDto, MunisListItem} from "../../../accounts-payments/models/accounts-payments.model";
import {ToastrService} from "ngx-toastr";
import {
  ServiceControllerCheckComponent
} from "../../../../../../core/components/service-controller-check/service-controller-check.component";
import {CreateTitleModalComponent} from "./my-office/modals/create-title-modal/create-title-modal.component";
import {MatDivider} from "@angular/material/divider";
import {
  ServiceControllerStore
} from "../../../../../../core/components/service-controller-check/service-controller.store";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-transfer-to-munis',
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, NgOptimizedImage, CreateTitleModalComponent, MatDivider],
  templateUrl: './transfer-to-munis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TransferToMunisComponent implements OnInit {

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private destroyRef=  inject(DestroyRef);
  private serviceStore  = inject(ServiceControllerStore);
  private toast=  inject(ToastrService);
  private sanitizer = inject(DomSanitizer);

  inputSubject = new Subject<any>();

  searchText = signal<string>('');
  officeName = signal<string>('');
  loading = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchData = signal<any>(null);
  searchValue = signal('');
  loadingMyOffice = signal<boolean>(false);
  createOffice = signal<boolean>(false);

  categoryList = signal<MunisCategoryListDto[] | null>([]);
  officeList = signal<MunisListItem[] | null>([]);
  currentMonth = signal('');
  prevMonth = signal('');
  skeletons = Array.from({ length: 15 });
  skeletonsOffice = Array.from({ length: 4 });


  ngOnInit(): void {
    const now = new Date();

    this.currentMonth.set(now.toLocaleString('ru-RU', { month: 'long' }));

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);
    this.prevMonth.set(prevDate.toLocaleString('ru-RU', { month: 'long' }))

    this.serviceStore.setServices(['MUNIS']);
    this.getServices();
    this.getMyOffice();

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

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  searchService(text: string) {
    this.paymentService.searchServiceMunis({
      page: 0,
      size: 100,
      parentId: null,
      query: text,
      type: null
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

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  getServices() {
    this.loading.set(true);
    this.paymentService.getMunisServices({parentId: null}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.categoryList.set(data.categories);
          this.loading.set(false);
        },
        error: error => {
          this.loading.set(false);
          this.toast.error(error.message);
        }
      })
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
          this.router.navigate(["payment/transfer-to-munis/create-transaction"],{
            queryParams: {
              serviceName: list.service.title,
              serviceId: list.service.id,
            }
          })
        } else {
          this.router.navigate(["payment/transfer-to-munis/create-transaction"],{
            queryParams: {
              serviceName: list.service.parent.title,
              serviceId: list.service.parent.id,
              childName: list.service.title,
              childId: list.service.id,
              fromSearch: "fromSearch"
            }
          })
        }
    }
  }

  navigateToServices(parentId: string, parentName: string) {
    this.router.navigate(["payment/transfer-to-munis/services"],{
      queryParams: {
        parentName: parentName,
        parentId: parentId
      }
    })
  }

  goToOfficeDetails(office: MunisListItem) {
    this.router.navigate(["payment/transfer-to-munis/my-office"], {
      queryParams: {
        id: office.uuid
      },
    })
    localStorage.setItem("office", JSON.stringify(office));
  }

  closeCreateOfficeModal(): void {
    this.createOffice.set(false);
  }

  getMyOffice() {
    this.loadingMyOffice.set(true);
    this.paymentService.getMyOffice().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.officeList.set(data);
        this.loadingMyOffice.set(false);
      },
      error: error => {
        this.toast.error(error.message);
        this.loadingMyOffice.set(false);
      }
    })
  }

  submitCreateOfficeButton() {
    this.paymentService.createOfficeName({name: this.officeName()}).pipe().subscribe({
      next: (res: any) => {
        console.log(res, "res")
        if (res) {
          this.router.navigate(["payment/transfer-to-munis/create-my-office"], {
            queryParams: {
              officeId: res.id
            }
          });
        } else {
          this.toast.error(res?.message);
        }
      },
      error: error => {
        this.toast.error(error.message);
      }
    })
  }

  setOfficeName(value: string) {
    this.officeName.set(value)
  }

}
