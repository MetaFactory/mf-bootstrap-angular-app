import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastifyOptions, ToastifyService } from './toastify.service';

@Component({
   selector: 'app-toastify',
   standalone: false,
   template: `
      <div
         *ngFor="let toast of toasts"
         [class]="'toastify ' + toast.class"
         (click)="toastifyService.remove(toast)"
      >
         {{ toast.text }}
         <i class="material-symbols-outlined">close</i>
      </div>
   `,
   styleUrl: './toastify.component.scss'
})
export class ToastifyComponent implements OnInit, OnDestroy {
   toasts: ToastifyOptions[] = [];
   private subscription!: Subscription;

   constructor(public toastifyService: ToastifyService) {}

   ngOnInit() {
      this.subscription = this.toastifyService.toastChanged.subscribe((toasts) => {
         this.toasts = toasts;
      });
   }

   ngOnDestroy() {
      this.subscription.unsubscribe();
   }
}
