import {
   HttpClient,
   HttpErrorResponse,
   HttpEvent,
   HttpHandler,
   HttpInterceptor,
   HttpRequest,
   HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import urlJoin from 'url-join';
import { ConfigService } from '../services';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
   constructor(
      private http: HttpClient,
      private config: ConfigService
   ) {}

   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const path = this.extractMockFileName(request.url).replace(/\?.*$/, '');
      if (
         path &&
         !request.url.includes('.json') &&
         this.config.value.api.mocked.some((mp) => new RegExp(`^${mp}/|^${mp}$`).test(path))
      ) {
         const mockFilePath = urlJoin('..', this.config.value.api.mockDataPath, `${path}.json`);
         console.warn('Mock:', path);

         return this.http.get(mockFilePath, { responseType: 'json' }).pipe(
            switchMap((data) => of(new HttpResponse({ status: 200, body: data }))),
            catchError((error: HttpErrorResponse) => {
               // If the file does not exist, forward the request to the actual API
               if (error.status === 404) {
                  return next.handle(request);
               }

               // If other errors occur, rethrow them
               return throwError(() => new Error(`Failed to fetch mock data: ${error.statusText}`));
            })
         );
      } else {
         return next.handle(request);
      }
   }

   private extractMockFileName(url: string) {
      const regEx = new RegExp('/api/(.+)');
      const match = url.match(regEx);
      return match ? match[0] : '';
   }
}
