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
import {MunisCategoryListDto} from "../../../../../../accounts-payments/models/accounts-payments.model";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-services-choose-create',
  imports: [CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, MatDivider],
  templateUrl: './services-choose.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateMyOfficeChooseServiceComponent implements OnInit {

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private destroyRef=  inject(DestroyRef);
  private toast=  inject(ToastrService);

  inputSubject = new Subject<any>();

  searchText = signal<string>('');
  officeName = signal<string>('');
  loading = signal<boolean>(false);
  createOffice = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchData = signal<any>(null);
  searchValue = signal('');

  categoryList = signal<MunisCategoryListDto[] | null>([]);
  skeletons = Array.from({ length: 15 });


  ngOnInit(): void {
    this.getServices();
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
      this.router.navigate(["payment/transfer-to-munis/create-my-office/services"],{
        queryParams: {
          parentName: list.category.title,
          parentId: list.category.id,
          officeId: this.route.snapshot.queryParamMap.get('officeId'),
          redirectUrl: this.route.snapshot.queryParamMap.get('redirectUrl'),
        }
      })
    }
  }

  searchService(text: string) {
    this.paymentService.searchServiceMunis({
      page: 0,
      size: 100,
      parentId: null,
      query: text,
      type: 'PAYMENT_CATEGORY'
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

  navigateToServices(parentId: string, parentName: string) {
    this.router.navigate(["payment/transfer-to-munis/create-my-office/services"], {
      queryParams: {
        parentName: parentName,
        parentId: parentId,
        officeId: this.route.snapshot.queryParamMap.get('officeId'),
        redirectUrl: this.route.snapshot.queryParamMap.get('redirectUrl'),
      }
    })
  }

  closeCreateOfficeModal(): void {
    this.createOffice.set(false);
  }

  submitCreateOfficeButton() {

  }

  setOfficeName(value: string) {
    this.officeName.set(value)
  }

}
