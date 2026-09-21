import { Pipe, PipeTransform } from '@angular/core';
import { StartProcessingAddress } from '@api/models/los/start-processing';

@Pipe({
  name: 'addressLine',
})
export class AddressLinePipe implements PipeTransform {
  transform(item: StartProcessingAddress, city: string, village: string, country: string): string {
    const parts = [item.zipCode, country, city, village, item.street].filter((part) => !!part);

    return parts.length ? `${parts.join(', ')}.` : '';
  }
}
