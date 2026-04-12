import {
   AfterContentInit,
   Component,
   ContentChildren,
   EventEmitter,
   Input,
   OnDestroy,
   Output,
   QueryList
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
   selector: 'app-menu',
   standalone: false,
   templateUrl: './menu.component.html',
   styleUrl: './menu.component.scss'
})
export class MenuComponent implements AfterContentInit, OnDestroy {
   @Input() open: boolean = false;
   @Output() close = new EventEmitter<void>();
   @ContentChildren(MenuItemComponent) items!: QueryList<MenuItemComponent>;

   private clickSubscriptions: Subscription[] = []; // To hold subscriptions for cleanup

   ngAfterContentInit(): void {
      // Subscribe to click events of all menu items
      this.items.forEach((item) => {
         const subscription = item.click.subscribe(() => {
            // When a menu item is clicked, emit the close event
            this.close.emit();
         });
         this.clickSubscriptions.push(subscription);
      });

      // If the QueryList changes, set up new subscriptions
      this.items.changes.subscribe((items: QueryList<MenuItemComponent>) => {
         // Clean up existing subscriptions
         this.clickSubscriptions.forEach((sub) => sub.unsubscribe());
         this.clickSubscriptions = [];

         // Set up new subscriptions
         items.forEach((item) => {
            const subscription = item.click.subscribe(() => {
               this.close.emit();
            });
            this.clickSubscriptions.push(subscription);
         });
      });
   }

   ngOnDestroy() {
      this.clickSubscriptions.forEach((sub) => sub.unsubscribe());
   }
}
