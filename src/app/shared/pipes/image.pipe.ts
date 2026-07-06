import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/development';

@Pipe({
  name: 'image',
})
export class ImagePipe implements PipeTransform {
  transform(value: string): string {
    if (environment.mode === 'development') {
      return `images/${value}`;
    }
    return `${environment.imageUrl}${value}`;
  }
}
