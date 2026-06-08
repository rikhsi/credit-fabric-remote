import {Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Router } from '@angular/router';
import {AppReportParentDTO} from "../../../../../../../../shared/interfaces/applications.interface";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-create-statement-modal',
  standalone: true,
  imports: [MatMenuModule, CommonModule, MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./create-statement-modal.component.scss'],
  template: `
    <div class="flex flex-col bg-[#FFF] dark:bg-[#000] h-full overflow-y-auto pb-5">
      <div class="flex flex-col p-5 border-b border-b-[#EBEBEB] gap-4">
        <div class="flex justify-between">
          <div class="justify-start text-[#171717] dark:text-[#f7f7f7] text-lg font-medium  leading-normal">{{'accountStatements.new_statement' | translate}}</div>
          <div (click)="close()"
            class="w-7 h-7 relative cursor-pointer bg-zinc-100 rounded-md flex justify-center items-center overflow-hidden">
            <img src="assets/new-icons/close.svg" alt="close">
          </div>
        </div>
      </div>

      <div class="p-5 pt-2">
        <div>
          @if (data.reportParentList && data.reportParentList.length > 0) {
            @for (parent of data.reportParentList; track $index) {
              <div (click)="navigateToCreateStatementRoute('/charts/create-statement', parent.value.toLowerCase())"
                class="flex gap-4 py-3 items-center cursor-pointer">
                <div class="flex space-x-2 items-center p-3 cursor-pointer bg-[#F7F7F7] dark:bg-[#171717] rounded-full">
                  <img src="./assets/new-icons/BLANK.svg" alt="" [style]="{height: '24px', width: '24px'}">
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-black dark:text-white">{{parent.description}}</p>
                  <p class="text-14 text-[#A3A3A3] mt-1">
                    {{parent.fileTypeDescription}}
                  </p>
                </div>
                <div>
                  <mat-icon class="w-6 h-6 text-black dark:text-white">keyboard_arrow_right</mat-icon>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class CreateStatementModalComponent {

  // tapName = signal<'REGULAR_DISCHARGE' | "ONE_TIME_STATEMENT">('REGULAR_DISCHARGE');

  constructor(
    protected _matDialogRef: MatDialogRef<CreateStatementModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { reportParentList: AppReportParentDTO[] | undefined, tabValue: string }
  ) {}

  close() {
    this._matDialogRef.close();
  }

  navigateToCreateStatementRoute(url: string, type: string) {
    const queryParams: any = { type };
    if (this.data.tabValue === "regular") {
      queryParams.regular = "true"
    }
    this.router.navigate([url], {queryParams});
    this.close();
  }
}

