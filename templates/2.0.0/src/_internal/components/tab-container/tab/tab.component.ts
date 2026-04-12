import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-tab',
   standalone: false,
   template: '<div *ngIf="isActive"><ng-content /></div>'
})
export class TabComponent {
   @Input() title!: string;
   @Input() isActive = false;
}
