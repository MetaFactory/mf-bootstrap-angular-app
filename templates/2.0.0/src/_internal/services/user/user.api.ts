import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ConfigService } from '../config-service';
import { EntityApi } from '../entity/entity.api';
import type { Account, AuthenticateResponse } from './user';

const entityPath = 'user';

@Injectable({ providedIn: 'root' })
export class UserApi extends EntityApi {
   accountApiTimeout: number;
   constructor(
      http: HttpClient,
      config: ConfigService,
      private api: ApiService
   ) {
      super(entityPath, http, config);
      this.accountApiTimeout = config.value.api.accountApiTimeout;
   }

   authenticate = (username: string, password: string, rememberMe: boolean) =>
      this.api.request<AuthenticateResponse>('authenticate', {
         payload: { username, password, rememberMe },
         withAuth: false,
         method: 'POST',
         timeout: 1000 //ms
      });

   getAccount = () => this.api.request<Account>('account', { timeout: this.accountApiTimeout });

   updateProfile = (account: Account) =>
      this.api.request('account', { method: 'POST', payload: account });

   getUserPreferences = () => this.api.request('owner/userpreferences/edit/my');

   updateUserPreferences = (value: unknown) =>
      this.api.request('owner/userpreferences/edit', { method: 'PUT', payload: value });

   getSession = (sid: string) =>
      this.api.request<{ token: string; backUrl: string }>('auth/session', {
         method: 'POST',
         payload: { sid },
         withAuth: false
      });
}
