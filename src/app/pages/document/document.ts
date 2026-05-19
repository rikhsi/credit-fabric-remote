import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ActivatedRoute, Router } from '@angular/router';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { BridgeService, SplashService } from '@core/services';
import { RootRoute } from '@constants';
import { OnlineApiService } from '@api/controllers/los';

@Component({
  selector: 'cf-document',
  imports: [NzButtonComponent, NzIconDirective, TranslocoDirective, NgxExtendedPdfViewerModule, NzSpinComponent],
  templateUrl: './document.html',
  styleUrl: './document.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Document implements OnInit {
  private splashService = inject(SplashService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bridge = inject(BridgeService);
  private api = inject(OnlineApiService);
  private notification = inject(NzNotificationService);

  public readonly isLoading = signal<boolean>(true);
  public readonly file = signal<string>(null);

  get backRoute(): string {
    return this.route.snapshot.queryParams['backRoute'];
  }

  get docId(): number {
    return +this.route.snapshot.params['docId'];
  }

  ngOnInit(): void {
    this.splashService.hide = true;

    this.initDocument();
  }

  onBack(): void {
    if (this.backRoute) {
      this.router.navigateByUrl(this.backRoute);
    } else {
      this.router.navigate([RootRoute.Applications]);
    }
  }

  onSign(): void {
    this.bridge.onSignClick(this.file());
  }

  pdfLoaded(): void {
    this.isLoading.set(false);
  }

  pdfFailed(): void {
    this.notification.error(translate('pdf.failed.title'), translate('pdf.failed.desc'));

    this.router.navigate([RootRoute.Applications]);
  }

  private initDocument(): void {
    this.api.getFile$(this.docId).subscribe({
      next: (result) => {
        this.file.set(`data:application/pdf;base64,${result}`);
      },
      error: () => {
        this.router.navigate([RootRoute.Applications]);
      },
    });
  }
}
