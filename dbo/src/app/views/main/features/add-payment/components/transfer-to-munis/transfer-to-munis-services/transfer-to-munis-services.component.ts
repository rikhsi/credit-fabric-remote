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
import {ThemeService} from "../../../../../../../shared/services/theme.service";
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {PaymentService} from "../../../../../../../core/services/payment.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MunisCategoryListDto} from "../../../../accounts-payments/models/accounts-payments.model";
import {MatDivider} from "@angular/material/divider";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-transfer-to-munis-services',
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, NgOptimizedImage, MatDivider],
  templateUrl: './transfer-to-munis-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TransferToMunisServicesComponent implements OnInit {

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private destroyRef=  inject(DestroyRef);
  private toast=  inject(ToastrService);


  inputSubject = new Subject<any>();
  skeletons = Array.from({ length: 15 });

  searchText = signal<string>('');
  parentName = signal<string>('');
  loading = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchData = signal<any>(null);
  searchValue = signal('');

  categoryList = signal<MunisCategoryListDto[] | null>([]);


  ngOnInit(): void {
    this.getServices();
    if (this.route.snapshot.queryParamMap.get('parentName')) {
       this.parentName.set(this.route.snapshot.queryParamMap.get('parentName') as string)
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

  searchService(text: string) {
    this.paymentService.searchServiceMunis({
      page: 0,
      size: 100,
      parentId: null,
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

  navigateToServices(serviceId: string, serviceName: string) {
    this.router.navigate(["payment/transfer-to-munis/create-transaction"],{
      queryParams: {
        serviceName: serviceName,
        serviceId: serviceId,
        parentId: this.route.snapshot.queryParamMap.get('parentId'),
      }
    })
  }

  backClick() {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      replaceUrl: true
    });
  }

}
