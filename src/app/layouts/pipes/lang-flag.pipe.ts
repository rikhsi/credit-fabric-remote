import { Pipe, PipeTransform } from '@angular/core';
import { LANGUAGE_FLAG } from '@constants';

@Pipe({
  name: 'langFlag',
})
export class LangFlagPipe implements PipeTransform {
  transform(lang: string): string {
    return LANGUAGE_FLAG[lang];
  }
}
