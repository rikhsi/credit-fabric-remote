import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export interface DownloadMetadata {
  body: any;
  fileName: string;
  endpoint?: string;
  [key: string]: any;
}

export interface Toast {
  id: number;
  fileName: string;
  fileSize: number; 
  progress: number; 
  status: 'downloading' | 'success' | 'error';
  downloadedBytes: number;
  isMinimized: boolean;
  metadata: DownloadMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class ToastrProgressService {
  private injector = inject(Injector)
  toasts = signal<Toast[]>([]);
  _toastr = toObservable(this.toasts, { injector: this.injector });

minimizedCount = computed(() => 
    this.toasts().filter(t => t.isMinimized).length
  );

  activeDownloadsCount = computed(() => 
    this.toasts().filter(t => t.status === 'downloading' && t.isMinimized).length
  );

  /**
   * Add a new toast with download metadata
   * Prevents duplicates by checking if file is already being downloaded
   */
  addToast(metadata: DownloadMetadata, fileSize: number = 0): number | null {
    const { fileName } = metadata;
    
    const existingToast = this.toasts().find(t => 
      t.fileName === fileName && t.status === 'downloading'
    );
    
    if (existingToast) {
      return null;
    }

    const newToast: Toast = {
      id: Date.now(),
      fileName: metadata.fileName,
      fileSize,
      progress: 0,
      status: 'downloading',
      downloadedBytes: 0,
      isMinimized: false,
      metadata
    };

    this.toasts.update(toasts => [...toasts, newToast]);
    return newToast.id;
  }

  updateProgress(id: number, downloadedBytes: number, totalBytes: number) {
    this.toasts.update(toasts =>
      toasts.map(toast => {
        if (toast.id === id) {
          const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
          return {
            ...toast,
            downloadedBytes,
            fileSize: totalBytes,
            progress: Math.min(progress, 100)
          };
        }
        return toast;
      })
    );
  }

  setError(id: number) {
    this.toasts.update(toasts =>
      toasts.map(toast =>
        toast.id === id ? { ...toast, status: 'error' as const } : toast
      )
    );
  }

  setSuccess(id: number) {
    this.toasts.update(toasts =>
      toasts.map(toast =>
        toast.id === id ? { ...toast, status: 'success' as const, progress: 100 } : toast
      )
    );
  }

  removeToast(id: number) {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  /**
   * Remove all toasts with the same fileName (cleanup duplicates if any exist)
   */
  removeToastsByFileName(fileName: string) {
    this.toasts.update(toasts => toasts.filter(toast => toast.fileName !== fileName));
  }

  /**
   * Get metadata for retry and remove the toast
   */
  getMetadataAndRemove(id: number): DownloadMetadata | null {
    const toast = this.getToast(id);
    if (!toast) return null;

    const metadata = toast.metadata;
    this.removeToast(id);
    
    return metadata;
  }

  getToast(id: number): Toast | undefined {
    return this.toasts().find(t => t.id === id);
  }

  minimizeToast(id: number) {
    this.toasts.update(toasts =>
      toasts.map(toast =>
        toast.id === id ? { ...toast, isMinimized: true } : toast
      )
    );
  }

  maximizeToast(id: number) {
    this.toasts.update(toasts =>
      toasts.map(toast =>
        toast.id === id ? { ...toast, isMinimized: false } : toast
      )
    );
  }

  maximizeAll() {
    this.toasts.update(toasts =>
      toasts.map(toast => ({ ...toast, isMinimized: false }))
    );
  }

  visibleToasts = computed(() => 
    this.toasts().filter(t => !t.isMinimized)
  );

  minimizedToasts = computed(() => 
    this.toasts().filter(t => t.isMinimized)
  );

  /**
   * Check if a file is currently being downloaded
   */
  isDownloading(fileName: string): boolean {
    return this.toasts().some(t => 
      t.fileName === fileName && t.status === 'downloading'
    );
  }
}