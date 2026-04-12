import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavItem } from '../../../types';

@Component({
   selector: 'app-link',
   standalone: false,
   templateUrl: './link.component.html',
   styleUrls: ['./link.component.css']
})
export class LinkComponent {
   @Input() item!: NavItem;
   @Input() selectedPath?: string;

   constructor(public translate: TranslateService) {}

   isExternal(path: string | undefined): boolean {
      return path?.startsWith('http') ?? false;
   }
}
