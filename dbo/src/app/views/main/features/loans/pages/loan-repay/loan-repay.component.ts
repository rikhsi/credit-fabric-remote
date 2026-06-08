import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIf, NgOptimizedImage } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-loan-repay',
  imports: [
    NgOptimizedImage,
    NgIf,
    NgxMaskPipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './loan-repay.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanRepayComponent {
  openAccount= signal<boolean>(false);
  isOpen= signal<boolean>(false);

  protected readonly Number = Number;
}
