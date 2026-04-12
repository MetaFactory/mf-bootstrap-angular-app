import { Pipe, PipeTransform } from '@angular/core';
import markdownit from 'markdown-it';

@Pipe({
   name: 'markdown',
   standalone: false
})
export class MarkdownPipe implements PipeTransform {
   private md = markdownit();

   constructor() {
      this.md = markdownit();
   }

   transform(value: string | undefined): string {
      return value ? this.md.render(value) : '';
   }
}
