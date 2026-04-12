import {
   HttpErrorResponse,
   HttpEvent,
   HttpHandler,
   HttpInterceptor,
   HttpRequest,
   HttpStatusCode
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).pipe(
         catchError((ex: HttpErrorResponse) => {
            if (ex.status === HttpStatusCode.Unauthorized) {
               window.location.assign('/oauth2/authorization/oidc');
            }

            return throwError(() => ex);
         })
      );
   }
}
