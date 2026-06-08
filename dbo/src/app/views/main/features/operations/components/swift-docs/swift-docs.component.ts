import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-swift-docs',
    imports: [DragDropModule, NgOptimizedImage, RouterLink, MatIcon],
    templateUrl: './swift-docs.component.html',
    styleUrls: ['./swift-docs.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftDocsComponent {
  onFileDropped(event: CdkDragDrop<any>) {
    const files = event.item.data;
    this.handleFiles(files);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  private handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Perform validation and upload logic here
    }
  }

}
