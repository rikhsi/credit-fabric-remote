import { MassPaymentsService } from './../../services/mass-payments.service';
// file-upload.component.ts
import { Component, Output, EventEmitter, inject, DestroyRef, ChangeDetectionStrategy, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { distinctUntilChanged, tap } from 'rxjs';
import { UploadState } from '../../models/mass-payments.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrProgressService } from 'src/app/shared/services/toastr-progress.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mass-payment-file-upload',
  standalone: true,
  imports: [CommonModule,SvgIconComponent, TranslateModule],
  template: `
    <div class="relative" >
      <input
        #fileInput
        type="file"
        accept=".xls,.xlsx"
        class="hidden"
        [disabled]="isUploading()"
        (change)="onFileSelected($event)"
      />
      <div
        class="border-dashed border-soft-200 bg-surface-2 rounded-[20px] w-[289px] border-1px p-[32px] gap-[20px] flex flex-col cursor-pointer transition-all "
        [class.border-primary-base]="isDragging"
        [class.surface-4]="isDragging"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >

        <div class="flex flex-col items-center">
           @if(isUploading()) {
               <div class="animate-spin">
                   <app-svg-icon name="hamkor_spinner" [size]="30" class=text-primary-base></app-svg-icon>
                 </div>
             }@else {
               <div class="bg-surface-5 rounded-[9px] p-3 max-h-[35px] max-w-[35px] flex items-center justify-center ">
                   <app-svg-icon [name]="'hamkor_download'" [size]="16" class="text-primary-base"></app-svg-icon>
              </div>
              }
        </div>

        <div class="flex flex-col items-center gap-[6px]">
          <div class="font-semibold text-custom-primary text-center">
                   {{ selectedFile ? selectedFile.name : ('new_third.upload_xls_file' | translate) }}
          </div>
          <div class="text-custom-muted font-medium text-center text-xs">
            {{ selectedFile
              ? formatFileSize(selectedFile.size)
              : ('new_third.drag_or_click_upload_limit_20mb' | translate)
            }}
            @if(isUploading()) {
              <span  class="text-custom-secondary text-xs ">
             {{ 'new_third.downloading' | translate }}....
            </span>
            }
          </div>

        </div>

        <div *ngIf="error" class="text-red-500 text-xs text-center">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

`],
changeDetection:ChangeDetectionStrategy.Default
})
export class MassPaymentFileUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Output() fileSelected = new EventEmitter<File>();
  private destroyRef = inject(DestroyRef);

  private massPaymentsService = inject(MassPaymentsService)
  isUploading = signal(false);


  selectedFile: File | null = null;
  isDragging = false;
  error: string = '';
  maxFileSize = 20 * 1024 * 1024;

  constructor(
      public toastService:ToastrProgressService,
      public translateService:TranslateService
  ) {
  }

  ngOnInit(): void {
    this.listenUploadExcel()
  }

  private listenUploadExcel() {
    this.massPaymentsService.uploadExcel$.pipe(
      distinctUntilChanged(),
      tap((state:UploadState)=> {
        this.isUploading.set(state.isUploading);
        if (!state.isUploading && this.selectedFile) {
          this.resetFileInput();
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  private resetFileInput() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.selectedFile = null;
    this.error = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.error = '';

    const validExtensions = ['.xls', '.xlsx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      this.error = this.translateService.instant('new_third.please_upload_a_file_in_XLS_or_XLSX_format');
      return;
    }

    if (file.size > this.maxFileSize) {
      this.error = 'Размер файла превышает 20 МБ';
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
