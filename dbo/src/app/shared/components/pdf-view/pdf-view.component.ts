import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-pdf-view',
    imports: [
        MatIcon,
        MatDialogClose
    ],
    templateUrl: './pdf-view.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfViewComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    private templateService: TemplateService,
    @Inject(MAT_DIALOG_DATA) public pdfSrc: string,
    private sanitizer: DomSanitizer
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
  }

  ngOnInit() {
    console.log('src', this.pdfSrc)
  }
}
