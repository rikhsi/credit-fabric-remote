import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-purpose',
  standalone: true,
  imports: [],
  templateUrl: './purpose.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurposeComponent implements OnInit {
  searchText = new FormControl('');
  purposes: { code: string, name: string }[] = [];

  constructor(
    private paymentService: PaymentService,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit() {
    this.watchSearchText();
  }

  watchSearchText() {
    this.searchText.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300))
      .subscribe(searchText => {
        if(searchText) {
          this.getPurposes(searchText);
        }
      })
  }

  getPurposes(searchText: string) {
    this.paymentService.getPurposes({
      page: 0,
      size: 10,
      searchText
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:(val) => {
          if(val) {
          }
        }
      })
  }
}
