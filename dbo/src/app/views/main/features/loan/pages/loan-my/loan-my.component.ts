import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLinkWithHref } from '@angular/router';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { environment } from 'src/environments/environment';
import { LoanFilterComponent } from '../../components/loan-filter/loan-filter.component';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MinorToMajorPipe } from 'src/app/shared/lib/minor-to-major.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {UserService} from "../../../../../../core/services/user.service";
import { MatMenuModule } from '@angular/material/menu';
import { LoanService } from '../../../loans/services/loan.service';
import { Loan } from '../../../loans/models/loan.model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LoanLogicService } from '../../services/loan-logic.service';
@Component({
  selector: 'app-loan-my',
  imports: [
        MatIconModule,
        SvgIconComponent,
        LoanFilterComponent,
        MatDividerModule,
        CommonModule,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        RouterLinkWithHref,
        PaginationComponent,
        MinorToMajorPipe,
        TranslateModule,
        MatTooltipModule,
        MatMenuModule,
        AsyncPipe
  ],
  templateUrl: './loan-my.component.html',
  styles: `
    .mat-menu-button app-svg-icon {
      transition: color 0.3s ease;
    }

    .mat-menu-button:hover app-svg-icon {
      color: #00A38D;
    }
  `,
  providers:[LoanLogicService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanMyComponent implements OnDestroy {

 
  readonly SVG_URL = environment.SVG_URL  
  public loanLogicService = inject(LoanLogicService)
  public loanService = inject(LoanService)

  public userService = inject(UserService)

 
  totalElements = signal(0)

  readonly loadApi  = inject(LoanService);
  readonly destroyRef = inject(DestroyRef);

  loanData = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null)

  ngOnInit(): void {
    this.loanLogicService.initForm('')
    this.loanLogicService.buildFilterStream(this.loadApi)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res) => {
      if (res) {
        this.loanData.set(res.content);
        this.totalElements.set(res.totalCount);
      }
    });
    
  }
 
  ngOnDestroy(): void {
    this.loanService.setIsLoanEmpty(false)
  }

openDetail(event:Event,loan:Loan) {
   event.stopPropagation();
   localStorage.setItem('loanData', JSON.stringify(loan))
   this.loanLogicService.openDetail(event,loan.loanId)
};

  pinAction(item:any) {
     if (this.userService.hasAction('CREDITS')) {
      this.pinLoan(item.loanId, item.pinned)
    }
  }


  pinLoan = (loanId: string, hasPin: boolean = false) => {
    if (hasPin) {
      this.loadApi.unPinLoan(loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getLoanList());
    } else {
      this.loadApi.pinLoan(loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getLoanList());
    }
  }


  getLoanList(){
    this.loanLogicService.loading.set(true)
    this.loadApi.getLoanList(this.loanLogicService.filterForm.value).subscribe(res  => {
        if (res) {
        this.loanData.set(res.content);
        this.totalElements.set(res.totalCount);
        console.log(2222,this.loanData())
      }
      this.loanLogicService.loading.set(false);
    })
  }


}
