import { Inject, Injectable } from '@angular/core';
import { CONFIG_TOKEN, CommonConfig } from '../types';

@Injectable({
   providedIn: 'root'
})
export class ConfigService {
   private _value: Readonly<CommonConfig>;

   constructor(@Inject(CONFIG_TOKEN) config: CommonConfig) {
      this._value = config;
   }

   get value(): Readonly<CommonConfig> {
      return this._value;
   }
}
