import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-agree-dialog',
    imports: [MatIcon, ReactiveFormsModule],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <div class="p-6 rounded-[42px] bg-white">
        <div class="flex justify-end">
          <button class="rounded-md p-[1.5px] bg-[#EBEBEB] w-7 h-7" (click)="_dialogRef.close()">
            <mat-icon class="text-base font-bold">close</mat-icon>
          </button>
        </div>
        <div class="flex h-[228px] justify-center items-center">
          <div class="">
            <div class="flex justify-center mb-4">
              <img src="assets/images/report.png" alt="">
            </div>
            <div class="text-center text-[#A3A3A3]">Готовим вашу</div>
            <div class="text-center text-[#A3A3A3]">выписку</div>
          </div>
        </div>
        <div class="flex justify-end items-center">
          <button class="p-[12px] rounded-xl border border-base text-white bg-[#00A38D]" (click)="_dialogRef.close()">Закрыть</button>
        </div>
      </div>
    `,
})
export class SuccessReportDialogComponent {
  constructor(public _dialogRef:MatDialogRef<SuccessReportDialogComponent>) {}
}
