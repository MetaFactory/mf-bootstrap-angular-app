import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class ToastifyService {
   toasts: any[] = [];
   toastChanged = new Subject<any[]>();
   defaultOptions: ToastifyOptions = { autoClose: 5000, class: 'success' };

   show(text: string, options: ToastifyOptions) {
      const toast = { text, ...this.defaultOptions, ...options };
      this.toasts.push(toast);
      this.toastChanged.next(this.toasts);

      setTimeout(() => this.remove(toast), toast.autoClose);
   }

   success(text: string, options?: ToastifyOptions) {
      this.show(text, { class: 'success', ...options });
   }

   info(text: string) {
      this.show(text, { class: 'info' });
   }

   failure(text: string) {
      this.show(text, { class: 'failure', autoClose: 30000 });
   }

   remove(toast: unknown) {
      this.toasts = this.toasts.filter((t) => t !== toast);
      this.toastChanged.next(this.toasts);
   }
}

export type ToastifyOptions = {
   text?: string;
   autoClose?: number;
   class?: string;
};
