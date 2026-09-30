import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ActivatedRoute, Router } from '@angular/router';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { finalize } from 'rxjs';
import { SigningDocumentsService } from '../../services';
import { OnlineSigningResultPayload, OnlineSigningResultSigner } from '@api/models/los/signing-document';
import { RootRoute } from '@app/constants/route-path';
import { RouteParam } from '@app/constants/route-param';
import { NativeEventData, NativeSignedData } from '@app/typings/bridge';
import { AuthService } from '@core/services/auth.service';
import { BridgeService } from '@core/services/bridge.service';
import { SplashService } from '@core/services/splash.service';
import { ToastService } from '@core/services/toast.service';
import { BounceDirective } from '@shared/directives';

/** Status sent to `online-signing-results` when native reports a successful signature. */
const SIGNED_STATUS = 'SIGNED';

@Component({
  selector: 'cf-document-detail',
  imports: [NzButtonComponent, NzIconDirective, TranslocoDirective, NgxExtendedPdfViewerModule, NzSpinComponent, BounceDirective],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDetail implements OnInit {
  private readonly splashService = inject(SplashService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bridge = inject(BridgeService);
  private readonly authService = inject(AuthService);
  private readonly signingDocumentsService = inject(SigningDocumentsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isLoading = signal<boolean>(true);
  /** Waiting for native signature or for the signing result to be stored. */
  public readonly isSigning = signal<boolean>(false);
  public readonly file = signal<string>(null);

  public readonly document = computed(() => this.signingDocumentsService.findDocument(this.applicationId, this.documentId));
  public readonly title = computed(() => this.document()?.documentName ?? '');

  get backRoute(): string {
    return this.route.snapshot.queryParams['backRoute'];
  }

  get applicationId(): string {
    return String(this.route.snapshot.params[RouteParam.AppId] ?? '');
  }

  get documentId(): string {
    return String(this.route.snapshot.params[RouteParam.DocId] ?? '');
  }

  ngOnInit(): void {
    this.splashService.hide = true;

    this.bridge.signed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => this.onSigned(event));

    this.initDocument();
  }

  onBack(): void {
    if (this.backRoute) {
      void this.router.navigateByUrl(this.backRoute);
    } else {
      void this.router.navigate(['/', RootRoute.Documents]);
    }
  }

  onSign(): void {
    if (this.isSigning() || !this.file() || !this.bridge.hasBridge()) {
      return;
    }

    this.isSigning.set(true);
    this.bridge.onSignClick(this.file());
  }

  pdfLoaded(): void {
    this.isLoading.set(false);
  }

  pdfFailed(): void {
    this.toast.error(translate('pdf.failed.title'), translate('pdf.failed.desc'));

    void this.router.navigate(['/', RootRoute.Documents]);
  }

  private initDocument(): void {
    // Meta (name, signers) is optional for rendering; content is required.
    this.signingDocumentsService.ensureLoaded$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.signingDocumentsService
      .getContent$(this.applicationId, this.documentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.file.set(toPdfSource(result.contentBase64)),
        error: () => void this.router.navigate(['/', RootRoute.Documents]),
      });
  }

  private onSigned(event: NativeEventData<NativeSignedData>): void {
    if (!this.isSigning()) {
      return;
    }

    if (event.status !== 'success' || !event.data?.signedPdfBase64) {
      this.isSigning.set(false);
      this.toast.error(translate('documents.sign.failed.title'), translate('documents.sign.failed.description'));
      return;
    }

    this.signingDocumentsService
      .sendSigningResult$(this.applicationId, this.documentId, this.buildSigningPayload(event.data))
      .pipe(
        finalize(() => this.isSigning.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(translate('documents.sign.success.title'), translate('documents.sign.success.description'));
          this.onBack();
        },
      });
  }

  private buildSigningPayload(data: NativeSignedData): OnlineSigningResultPayload {
    const completedAt = data.completedAt ?? new Date().toISOString();

    return {
      completedAt,
      signedPdfBase64: data.signedPdfBase64,
      signers: data.signers?.length ? data.signers : this.resolveSigners(completedAt, data.confirmationMethods ?? ''),
      status: data.status ?? SIGNED_STATUS,
    };
  }

  /** Native did not describe signers — use the document signers matching the current user (or all of them). */
  private resolveSigners(signedAt: string, confirmationMethods: string): OnlineSigningResultSigner[] {
    const signers = this.document()?.signers ?? [];
    const userPinfl = this.authService.user()?.pinfl;
    const own = signers.filter((signer) => signer.pinfl === userPinfl);

    return (own.length ? own : signers).map((signer) => ({
      pinfl: signer.pinfl,
      role: signer.role,
      signedAt,
      status: SIGNED_STATUS,
      confirmationMethods,
    }));
  }
}

function toPdfSource(content: string): string {
  return content.startsWith('http') || content.startsWith('data:') ? content : `data:application/pdf;base64,${content}`;
}
