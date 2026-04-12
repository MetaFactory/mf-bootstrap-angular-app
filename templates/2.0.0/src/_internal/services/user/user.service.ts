import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import queryString from 'query-string';
import {
   GENERAL_ERROR_PAGE,
   LOGIN_CALLBACK_PAGE,
   LOGIN_FAILED_PAGE,
   STORAGE_KEY_TOKEN
} from '../../constants';
import { PathAuthority } from '../../types';
import { ConfigService } from '../config-service';
import { StoreServiceBase } from '../store-service-base';
import type { Account } from './user';
import { UserApi } from './user.api';
import { accountSet } from './user.reducer';

@Injectable({
   providedIn: 'root'
})
export class UserService {
   constructor(
      private userApi: UserApi,
      private config: ConfigService
   ) {}

   account: Account | null = null;
   storeService: StoreServiceBase | null = null;

   async init(storeService: StoreServiceBase) {
      this.storeService = storeService;
      // console.log('init UserService', window.location.pathname);

      if (window.location.pathname === LOGIN_FAILED_PAGE) {
         return true;
      }

      //! Maybe it is not needed anymore
      if (window.location.pathname === '/api/auth/callback') {
         console.log('API auth callback');
         try {
            const url = window.location.pathname + window.location.search + '&time=' + Date.now();
            const response = await fetch(url, {
               method: 'GET',
               headers: {
                  ResponseType: 'json'
               }
            });

            // If backend responds with a redirect status and JSON body containing redirectUrl, follow it.
            if (response.status >= 300 && response.status < 400) {
               let body: any = null;
               try {
                  body = await response.json();
               } catch {
                  // ignore JSON parse errors; we'll fall back to Location header
               }
               const redirectUrl = body?.redirectUrl ?? response.headers.get('Location');
               if (redirectUrl && typeof redirectUrl === 'string') {
                  window.location.assign(redirectUrl);
                  return false;
               }
            }

            const resJson = await response.json().catch(() => null);
            console.log('API auth callback response', resJson);
            return true;
         } catch (error) {
            console.error('API auth callback failed', error);
            return false;
         }
      }

      if (window.location.pathname === LOGIN_CALLBACK_PAGE) {
         const query = queryString.parse(window.location.search) as { sid: string };
         if (query.sid) {
            try {
               const { token, backUrl } = await this.userApi.getSession(query.sid as string);

               if (token) {
                  // Save the token
                  localStorage.setItem(STORAGE_KEY_TOKEN, token);

                  // Ensure localStorage write completes before redirect, 1000 to prevent race condition
                  await new Promise((resolve) => setTimeout(resolve, 1000));

                  // Redirect to back URL or default page
                  const redirectUrl = backUrl || '/';
                  console.log('Redirecting to:', redirectUrl);
                  window.location.href = redirectUrl;
               }
            } catch (error) {
               console.error('Failed to get session:', error);
               window.location.href = LOGIN_FAILED_PAGE;
            }
         } else {
            console.error('No sid parameter found in signin callback');
            window.location.href = LOGIN_FAILED_PAGE;
         }
         return false;
      }

      if (!this.account && window.location.pathname !== GENERAL_ERROR_PAGE) {
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               window.location.assign('/oauth2/authorization/oidc');
               return false;
            }

            this.account = await this.userApi.getAccount();
            storeService.dispatch(accountSet(this.account));
         } catch {
            // 401 is handled by HttpErrorInterceptor → redirects to OAuth2 login
            return false;
         }
      }

      return true;
   }

   async updateProfile(account: Account) {
      await this.userApi.updateProfile(account);
      this.account = account;
   }

   async getUserPreferences() {
      return await this.userApi.getUserPreferences();
   }

   async updateUserPreferences(value: unknown) {
      await this.userApi.updateUserPreferences(value);
   }

   async logout() {
      localStorage.removeItem('token');
      // window.location.href = this.config.value.ssoEnabled
      //    ? getSSOSignoutUrl(this.config.value)
      //    : LOGIN_PAGE;
      window.location.href = '/';
   }

   async authenticate(username: string, password: string, rememberMe: boolean) {
      try {
         const res = await this.userApi.authenticate(username, password, rememberMe);
         if (res?.id_token) {
            localStorage.setItem('token', res?.id_token);
            return 'Success';
         }
         return false;
      } catch (e: any) {
         if (e.name === 'TimeoutError') {
            return 'TimeoutError';
         } else if (e.status == 0) {
            return 'NetworkIssue';
         } else if (e.status == HttpStatusCode.BadRequest) {
            return 'BadRequest';
         } else if (e.status == HttpStatusCode.Unauthorized) {
            return 'InvalidUserPass';
         } else {
            return false;
         }
      }
   }

   checkPathAuthority(appAuthorities: PathAuthority[], path?: string) {
      if (!path) return true;
      path = path.replace(/^\/|\/$/, '');

      const appAuthority = appAuthorities.find((auth) => {
         if (!auth.path) return false;

         // Convert the wildcard path to a RegExp
         const regex = new RegExp(`^${auth.path.replace(/\*/g, '.*')}$`);
         return regex.test(path!);
      });

      const hasAccess = this.checkAuthority(appAuthority?.authority);
      // console.log('checkPathAuthority', appAuthority, this.account?.authorities, hasAccess);
      return hasAccess;
   }

   /**
    * Checks if the user has the authority to access the resource based on the given authority
    * @param authority: resource authority
    * @returns true, if authority is not defined or the user has the authority
    */
   checkAuthority(authority?: string | null | string[]) {
      if (!authority) return true;

      if (!this.account?.authorities) {
         console.error('User account is not loaded');
         return false;
      }

      if (typeof authority === 'string') {
         return this.account?.authorities.some((userAuth) => authority === userAuth);
      } else {
         return this.account?.authorities.some((userAuth) => authority.includes(userAuth));
      }
   }
}
