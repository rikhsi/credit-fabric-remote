import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';

@Component({
    selector: 'app-file-loader',
    imports: [],
    templateUrl: './file-loader.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileLoaderComponent {
  @Output() downloaded = new EventEmitter();
  @Input() title = '';
  @Input() description = '';
  @Input() touched = false;

  file: any;

  constructor(
    private destroyRef: DestroyRef,
    private accountsPaymentsService: AccountsPaymentsService,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  uploadFile(file: any) {
    this.accountsPaymentsService
      .fileUpload(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res) return;
        if(res.downloadUrl) {
          this.file = file;
          this.downloaded.emit(res.downloadUrl);
          this._cdRef.markForCheck();
        }
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file);
    }
  }

  remove() {
    this.file = null;
    this.downloaded.emit('');
  }
}
