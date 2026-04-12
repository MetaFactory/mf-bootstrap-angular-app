import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'extractProperty',
   standalone: false
})
export class ExtractPropertyPipe implements PipeTransform {
   transform(obj: any, propertyName: string): any {
      if (!obj || !propertyName) {
         return obj;
      }
      return obj[propertyName];
   }
}
