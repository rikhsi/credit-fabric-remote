import { MassPaymentsService } from './../../services/mass-payments.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { BalanceComponent } from '../../../new-main/components/balance/balance.component';
import { PaymentsComponent } from './components/payments/payments.component';

@Component({
  selector: 'app-created-payments',
  imports: [TranslateModule,BalanceComponent,PaymentsComponent],
  templateUrl: './created-payments.component.html',
  styles: ``,
  standalone:true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class CreatedPaymentsComponent implements OnInit {
 
  constructor(
    public theme: ThemeService,
    protected router: Router,
    private massPaymentsService:MassPaymentsService
  ) {
  }

  ngOnInit(): void {
      
  }

}
