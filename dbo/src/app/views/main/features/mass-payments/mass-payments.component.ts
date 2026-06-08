import { HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MassPaymentsService } from './services/mass-payments.service';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { MassPaymentFileUploadComponent } from './components/file-upload/mass-payment-file-upload.component';
import { MassPaymentTableComponent } from './components/mass-payment-table/mass-payment-table.component';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { DownloadMetadata, ToastrProgressService } from 'src/app/shared/services/toastr-progress.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mass-payments',
  imports: [
    TranslateModule,
    MatIconModule,
    MassPaymentFileUploadComponent,
    MassPaymentTableComponent
    ],
  templateUrl: './mass-payments.component.html',
  styleUrls: ['./mass-payments.component.scss'],
  standalone:true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MassPaymentsComponent  implements OnInit,OnDestroy{
  title = 'new_third.massPayments';
  constructor(
    public toastService:ToastrProgressService,
    public theme: ThemeService,
    protected router: Router,
    private massPaymentsService:MassPaymentsService,
    private toastrService:ToastrService,
    private translateService:TranslateService

  ) {
  }
  private downloadAbortControllers = new Map<number, AbortController>();
  private API_URL = `${environment.API_BASE}`;

  private testMode = false; // false qiling real download uchun
  private testIntervals = new Map<number, any>(); 
  private activeDownloads = new Set<string>(); 



 ngOnInit() {
      window.addEventListener('retry-download', this.handleRetryEvent.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('retry-download', this.handleRetryEvent.bind(this));

      this.testIntervals.forEach((interval, toastId) => {
    clearInterval(interval);
  });
  this.testIntervals.clear();
  this.activeDownloads.clear();
  }

  private handleRetryEvent(event: Event) {
    const customEvent = event as CustomEvent;
    const { id, metadata } = customEvent.detail;
    this.retryDownload(id, metadata.fileName);
  }

  private retryDownload(oldToastId: number, fileName: string) {
    this.toastService.removeToast(oldToastId);
    this.downloadFile(fileName);
  }


downloadFile(fileName: string) {
  if (this.activeDownloads.has(fileName)) {
    console.warn('⚠️ Already downloading:', fileName);
    return;
  }
  const metadata: DownloadMetadata = {
      body: {
        fileId:fileName
      },
      fileName: `payment_${fileName}.xlsx`,
    endpoint:`${this.API_URL}/api/core-transaction/v1/payment/file/data/download/excel`
    };


  if (this.activeDownloads.has(fileName)) {
      console.warn('⚠️ Already downloading:', fileName);
      return;
  }

  const toastId = this.toastService.addToast(metadata);
   if (toastId === null) {
      return;
    }
  this.activeDownloads.add(fileName);

  if (this.testMode) {
    this.simulateDownload(toastId, fileName);
    return;
  }


 
  this.massPaymentsService.downloadPaymentFile(metadata.body).subscribe({
    next: (event) => {
      if (event.type === HttpEventType.DownloadProgress) {
        const downloadedBytes = event.loaded;
        const totalBytes = event.total || 0;
        
        this.toastService.updateProgress(toastId, downloadedBytes, totalBytes);
        
      } else if (event.type === HttpEventType.Response) {
        this.toastService.setSuccess(toastId);
        this.activeDownloads.delete(fileName);
        const blob = event.body as Blob;
        this.saveFile(blob, fileName);
        
        setTimeout(() => {
          this.toastService.removeToast(toastId);
        }, 3000);
      }
    },
    error: (error) => {
      this.toastService.setError(toastId);
      this.activeDownloads.delete(fileName); 
    }
  });
}

// 3. FIXED simulateDownload metodi
private simulateDownload(toastId: number, fileName: string) {
  const totalBytes = 5 * 1024 * 1024; // 5 MB
  let downloadedBytes = 0;

  const interval = setInterval(() => {
    const toast = this.toastService.getToast(toastId);
    if (!toast) {
      clearInterval(interval);
      this.testIntervals.delete(toastId);
      this.activeDownloads.delete(fileName);
      return;
    }

    const speed = Math.random() * 400 * 1024 + 200 * 1024;
    downloadedBytes = Math.min(downloadedBytes + speed, totalBytes);

    this.toastService.updateProgress(toastId, downloadedBytes, totalBytes);

    const progress = Math.round((downloadedBytes / totalBytes) * 100);
    
    if (downloadedBytes >= totalBytes) {
      clearInterval(interval);
      this.testIntervals.delete(toastId);
      this.activeDownloads.delete(fileName);
      
      
      this.toastService.setSuccess(toastId);
      
      setTimeout(() => {
        this.toastService.removeToast(toastId);
      }, 3000);
    }
  }, 300); 

  this.testIntervals.set(toastId, interval);
}



clearAllDownloads() {
  this.testIntervals.forEach(interval => clearInterval(interval));
  this.testIntervals.clear();
  this.activeDownloads.clear();
  
  this.toastService.toasts().forEach(toast => {
    this.toastService.removeToast(toast.id);
  });
}



  private saveFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onFileUploaded(file: File): void {
    this.massPaymentsService.setUploadExcel(true,file.name,0)
    this.massPaymentsService.paymentPrepareFile(file).pipe(
      tap((res:any) => {
        if(res?.body?.result?.actionType == "ERROR") {
           this.toastrService.error(file.name,res.body.result.message)
        }else if(res?.body?.result?.actionType == "SUCCESS") {
            this.toastrService.success(file.name,this.translateService.instant('new_third.file.upload.success'))
            this.massPaymentsService.refreshMassPaymentTable()
        }
      }),
      finalize(() => {
         this.massPaymentsService.completeUpload()
      }),
      catchError(err => {
        this.toastrService.error(this.translateService.instant('new_third.file.upload.error'))
        return EMPTY
      })
    ).subscribe()
  }


}
