// error-handler.service.ts
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
   constructor(private injector: Injector) {}

   handleError(error: any): void {
      // Get the router instance
      const router = this.injector.get(Router);

      // Log the error or send it to server
      console.error('An unexpected error occurred:', error);

      // Redirect to the general error page
      router.navigate(['/general-error']);
   }
}
