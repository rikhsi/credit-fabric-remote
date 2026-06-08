import { AfterViewInit, Component, DestroyRef, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { AuthService } from '../../../views/auth/services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgOptimizedImage } from '@angular/common';
import * as mammoth from 'mammoth';
import { HttpClient } from '@angular/common/http';


@Component({
    selector: 'app-doc-modal',
    templateUrl: './doc-modal.component.html',
    styleUrls: ['./doc-modal.component.scss'],
    imports: [
        MatDialogClose,
        MatInput,
        FormsModule,
        MatCheckbox,
        NgClass,
        NgOptimizedImage
    ]
})
export class DocModalComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  checked = false;
  isScrolledToBottom = false;

  constructor(
    private authService: AuthService,
    private matDialogRef: MatDialogRef<DocModalComponent>,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: { widget: any, url: string, offerName: string, publicOfferName: string },
    private http: HttpClient,
  ) {
  }


  convertedHtml = '';

  ngOnInit() {
    this.getFile()
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const threshold = 1;

    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < threshold;

    this.isScrolledToBottom = isAtBottom;
  }

  scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;

    void container.offsetHeight;

    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }

  getFile() {
    this.http.get(this.data.url, { responseType: 'arraybuffer' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (arrayBuffer) => {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          this.convertedHtml = result.value;

          setTimeout(() => {
            if (this.scrollContainer?.nativeElement) {
              this.scrollContainer.nativeElement.scrollTop = 0;
            }
          }, 100);
        }
      })
  }

  update() {
    if(!this.checked) return;

    this.authService.saveUserSettings({
      ...this.data.widget,
      [this.data.publicOfferName]: true,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {}
          this.matDialogRef.close('approved');
        }
      });
  }
}
