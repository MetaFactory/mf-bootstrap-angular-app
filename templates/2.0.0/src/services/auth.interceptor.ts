import {
   HttpErrorResponse,
   HttpEvent,
   HttpHandler,
   HttpInterceptor,
   HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { config } from 'src/config';
import urlJoin from 'url-join';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
   constructor(private router: Router) {}

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Get the session token from localStorage
      const sessionToken = localStorage.getItem('token');

      // Add the session token to the request headers if it exists
      if (sessionToken) {
         req = req.clone({
            setHeaders: {
               Authorization: `Bearer ${sessionToken}`
            }
         });
      }

      return next.handle(req).pipe(
         catchError((error: HttpErrorResponse) => {
            // Handle 401 Unauthorized errors
            if (error.status === 401) {
               // Clear the stored session token
               // localStorage.removeItem('token');

               // Redirect to backend signin endpoint with current URL as back parameter
               const currentUrl = encodeURIComponent(window.location.href);
               const signinUrl = urlJoin(config.apiBaseUrl, `signin?back=${currentUrl}`);

               // Redirect to the signin URL
               window.location.href = signinUrl;
            }

            return throwError(() => error);
         })
      );
   }
}
