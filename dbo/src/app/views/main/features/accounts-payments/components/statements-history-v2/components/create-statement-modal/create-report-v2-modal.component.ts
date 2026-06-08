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
  selector: 'app-create-report-v2-modal',
  standalone: true,
  imports: [MatMenuModule, CommonModule, MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./create-statement-modal.component.scss'],
  template: `
    <div class="flex flex-col bg-[#FFF] dark:bg-[#000] h-full overflow-y-auto pb-5">
      <div class="flex flex-col p-5 border-b border-b-[#EBEBEB] gap-4">
        <div class="flex justify-between items-center">
<!--          <div class="justify-start text-[#171717] dark:text-[#f7f7f7] text-lg font-medium  leading-normal">{{'accountStatements.new_statement' | translate}}</div>-->
          <div class="flex items-center gap-2">
            @if (selectedParent) {
              <button
                (click)="backToParents()"
                class="p-1 rounded-md bg-zinc-100 w-8 h-8">
                <mat-icon>arrow_back</mat-icon>
              </button>
            }

            <div class="text-lg font-medium text-black dark:text-white">
              @if (selectedParent) {
                <span>{{selectedParent.description | translate}}</span>
              }
<!--              {{ selectedParent ? selectedParent?.description : ('accountStatements.new_statement' | translate) }}-->
<!--              {{ selectedParent && selectedParent?.description ? selectedParent?.description : 'accountStatements.new_statement' | translate }}-->
            </div>
          </div>
          <div (click)="close()"
            class="w-7 h-7 relative cursor-pointer bg-zinc-100 rounded-md flex justify-center items-center overflow-hidden">
            <img src="assets/new-icons/close.svg" alt="close">
          </div>
        </div>
      </div>

      <div class="p-5 pt-2">
        <div>
          @if (selectedParent) {
            @for (child of selectedParent.child; track $index) {
              <div (click)="navigateToCreateStatementRoute(child.value.toLowerCase())" class="flex gap-4 py-3 items-center cursor-pointer">

                <div class="flex space-x-2 items-center p-3 cursor-pointer bg-[#F7F7F7] dark:bg-[#171717] rounded-full">
                  <img src="./assets/new-icons/BLANK.svg" style="width:24px;height:24px">
                </div>

                <div class="flex-1">
                  <p class="font-semibold text-black dark:text-white">{{ child.description }}</p>
                  <p class="text-14 text-[#A3A3A3] mt-1">{{ child.fileTypeDescription }}</p>
                </div>

                <div>
                  <mat-icon class="w-6 h-6 text-black dark:text-white">keyboard_arrow_right</mat-icon>
                </div>
              </div>
            }
          } @else {
            @for (parent of data.reportParentList; track $index) {
              <div (click)="selectParent(parent)" class="flex gap-4 py-3 items-center cursor-pointer">

                <div class="flex space-x-2 items-center p-3 cursor-pointer bg-[#F7F7F7] dark:bg-[#171717] rounded-full">
                  <img src="./assets/new-icons/BLANK.svg" style="width:24px;height:24px">
                </div>

                <div class="flex-1">
                  <p class="font-semibold text-black dark:text-white">{{ parent.description | translate }}</p>
                  <p class="text-14 text-[#A3A3A3] mt-1">{{ parent.fileTypeDescription }}</p>
                </div>

                <div>
                  <mat-icon class="w-6 h-6 text-black dark:text-white">keyboard_arrow_right</mat-icon>
                </div>
              </div>
            }
          }
<!--          @if (data.reportParentList && data.reportParentList.length > 0) {-->
<!--            @for (parent of data.reportParentList; track $index) {-->
<!--              <div (click)="navigateToCreateStatementRoute(parent.value.toLowerCase())"-->
<!--                class="flex gap-4 py-3 items-center cursor-pointer">-->
<!--                <div class="flex space-x-2 items-center p-3 cursor-pointer bg-[#F7F7F7] dark:bg-[#171717] rounded-full">-->
<!--                  <img src="./assets/new-icons/BLANK.svg" alt="" [style]="{height: '24px', width: '24px'}">-->
<!--                </div>-->
<!--                <div class="flex-1">-->
<!--                  <p class="font-semibold text-black dark:text-white">{{parent.description}}</p>-->
<!--                  <p class="text-14 text-[#A3A3A3] mt-1">-->
<!--                    {{parent.fileTypeDescription}}-->
<!--                  </p>-->
<!--                </div>-->
<!--                <div>-->
<!--                  <mat-icon class="w-6 h-6 text-black dark:text-white">keyboard_arrow_right</mat-icon>-->
<!--                </div>-->
<!--              </div>-->
<!--            }-->
<!--          }-->
        </div>
      </div>
    </div>
  `,
})
export class CreateReportV2ModalComponent {

  // tapName = signal<'REGULAR_DISCHARGE' | "ONE_TIME_STATEMENT">('REGULAR_DISCHARGE');
  selectedParent: AppReportParentDTO | null = null;

  constructor(
    protected _matDialogRef: MatDialogRef<CreateReportV2ModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {
      reportParentList: AppReportParentDTO[] | undefined,
      tabValue: string
    }
  ) {}

  close() {
    this._matDialogRef.close();
  }

  selectParent(parent: AppReportParentDTO) {
    if (parent.child && parent.child.length > 1) {
      this.selectedParent = parent;
    } else {
      this.navigateToCreateStatementRoute(parent.value);
    }
  }

  backToParents() {
    this.selectedParent = null;
  }

  navigateToCreateStatementRoute(template_id: string) {
    const queryParams: any = { template_id };

    if (this.data.tabValue === 'regular') {
      queryParams.regular = 'true';
    }

    this.router.navigate(['/reports/create'], { queryParams });
    this.close();
    this.selectedParent = null;
  }

  // navigateToCreateStatementRoute(url: string, template_id: string) {
  //   const queryParams: any = { template_id };
  //   if (this.data.tabValue === "regular") {
  //     queryParams.regular = "true"
  //   }
  //   this.router.navigate([url], {queryParams});
  //   this.close();
  // }
}

