import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
   Observable,
   catchError,
   firstValueFrom,
   fromEvent,
   takeUntil,
   throwError,
   timeout
} from 'rxjs';
import urlJoin from 'url-join';
import { ApiCallParams, SelectOption } from '../types';
import { ConfigService } from './config-service';

@Injectable({
   providedIn: 'root'
})
export class ApiService {
   constructor(
      private http: HttpClient,
      private config: ConfigService
   ) {}

   /**
    * Calls the API
    * @param path (required) the path to call, relative to the API base URL (e.g. /employee/story)
    * @param method (default: GET), the HTTP method
    * @param payload (optional), a json object which needs to pass as the body of the request
    * @param withAuth (default: true), if false, the Authorization header is not sent
    * @returns
    */
   async request<T = unknown>(path: string, params?: ApiCallParams): Promise<T> {
      const url = urlJoin(
         this.config.value.api.baseUrl,
         params?.rootApi ? '' : 'api',
         params?.authority || '',
         path
      );
      const { method = 'GET', payload, withAuth = true, signal } = params || {};
      const headers = new HttpHeaders({
         Authorization:
            withAuth && this.config.value.api.token ? 'Bearer ' + this.config.value.api.token : '',
         ...(payload ? { 'Content-Type': 'application/json' } : {})
      });
      const options = {
         headers,
         body: payload ? JSON.stringify(payload) : undefined,
         observe: params?.observe ?? 'body',
         responseType: params?.responseType || 'json',
         withCredentials: withAuth
      };

      let request$ = this.http.request(method, url, options).pipe(
         timeout(params?.timeout ?? this.config.value.api.defaultTimeout),
         catchError((err) => {
            if (err.name === 'TimeoutError') {
               console.error('Request timed out', err);
            } else if (signal && err.name === 'AbortError') {
               console.error('Request aborted', err);
            } else {
               console.error('Request failed', err);
            }

            return throwError(() => err);
         })
      );

      if (signal) {
         const abort$ = fromEvent(signal, 'abort');
         request$ = request$.pipe(takeUntil(abort$));
      }

      return (await firstValueFrom(request$)) as T;
   }

   multipartRequest(path: string, formData: FormData): Observable<any> {
      try {
         const url = urlJoin(this.config.value.api.baseUrl, 'api', path);
         console.warn('multipartRequest', url);
         return this.http.post(url, formData, {
            headers: {
               Authorization: 'Bearer ' + this.config.value.api.token
            },
            withCredentials: true,
            reportProgress: true,
            observe: 'events'
         });
      } catch (ex) {
         console.error('multipartRequest error', ex);
         throw ex;
      }
   }

   async filterListOptions(url: string, filterKey: string, filterValue: string) {
      return await this.request<SelectOption[]>(
         `${url.replace(/^api\//, '')}?${filterKey}=${filterValue}`
      );
   }
}
