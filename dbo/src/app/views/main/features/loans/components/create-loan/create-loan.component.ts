import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { ILoanProduct, LoanDto } from '../../models/loan.model';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { take } from 'rxjs';
import { AmountService } from '../../../../../../core/services/amount.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { LoanHeaderComponent } from '../../../../../../shared/components/loan-header/loan-header.component';

@Component({
    selector: 'app-create-loan',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        ReactiveFormsModule,
        MatFormField,
        MatFormFieldModule,
        MatInput,
        NgxMaskDirective,
        LoanHeaderComponent,
    ],
    templateUrl: './create-loan.component.html',
    styleUrls: ['./create-loan.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLoanComponent implements OnInit {
  title = 'Подать заявку';
  loanInfo!: ILoanProduct;
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Доступные кредиты',
      link: '/loans/available-loans'
    },
    {
      title: 'Легкий кредит для развития бизнеса',
      link: `/loans/available-loans/${this.loanInfo?.id}`
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  types = [
    {
      title: 'Аннуитетный',
      value: 'DEBIT',
    },
    {
      title: 'Дифференцированный',
      value: 'CREDIT',
    },
  ];

  loan: any = {
    minAmount: 5000,
    maxAmount: 30000000,
  };

  loanForm = this.fb.group({
    amount: ['', Validators.required],
  });

  slideAmount = 0;

  constructor(
    private route: ActivatedRoute,
    private loanService: LoanService,
    private cf: ChangeDetectorRef,
    private utilsService: UtilsService,
    public amountService: AmountService,
    private fb: FormBuilder,
  ) {
    this.loan.minAmount = 5000;
    this.loan.maxAmount = 300000;
  }

  ngOnInit(): void {
    this.initLoan();
  }

  initLoan() {
    const id = this.route.snapshot.params['id'];
    this.loanService.getLoanInfo(id).pipe(take(1))
      .subscribe((loan) => {
      if (!loan) return;
      this.loanInfo = loan;
      this.navs[2].link = `/loans/available-loans/${loan?.id}`;
      this.navs = [...this.navs];
      this.cf.detectChanges();
    });
  }

  onSlideAmount(event: any) {
    this.loanForm.patchValue({
      amount: `${+event.target.value/100}`
    });
  }

  changeAmount() {
    const v = this.loanForm.getRawValue().amount;
    let amount = Number(v) * 100;

    if(amount > this.loanInfo.maxAmount) {
      this.loanForm.patchValue({
        amount: `${this.loanInfo.maxAmount /100}`,
      });

      amount = this.loanInfo.maxAmount /100;
    }

    this.slideAmount = amount;
    this.cf.detectChanges();
  }

  protected readonly Number = Number;
}
