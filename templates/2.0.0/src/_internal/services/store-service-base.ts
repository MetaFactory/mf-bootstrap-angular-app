import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { AnyAction, Reducer, Slice, configureStore } from '@reduxjs/toolkit';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import isEqual from 'lodash.isequal';
import { BehaviorSubject } from 'rxjs';
import { EntityServiceInfo } from '../types';
import { ConfigService } from './config-service';
import { EntityApi } from './entity/entity.api';
import { EntityService } from './entity/entity.service';
import { GeneralState } from './general/general.state';
import { UserState } from './user/user.state';

export type CommonState = {
   user: UserState;
   general: GeneralState;
};

export abstract class StoreServiceBase<STATE extends CommonState = CommonState> {
   constructor(
      reducer: Reducer<STATE>,
      autoSlices: Slice[],
      dynamicServices: EntityServiceInfo[],
      injector: Injector
   ) {
      this.config = injector.get(ConfigService);
      this.http = injector.get(HttpClient);

      for (const service of dynamicServices) {
         const api = new EntityApi(service.path, this.http, this.config);
         const slice = autoSlices.find((slice) => slice.name === service.name)!;
         const _ = new EntityService(api, this, slice, injector);
      }

      this.store = configureStore({
         reducer,
         devTools: this.config.value.devTools
      });
   }

   private http: HttpClient;
   private config: ConfigService;
   public store: ToolkitStore<STATE, AnyAction>;

   dispatch(action: AnyAction) {
      this.store.dispatch(action);
   }

   getState() {
      return this.store.getState();
   }

   select(selector: (state: STATE) => any) {
      // todo
      const val$ = new BehaviorSubject(selector(this.store.getState()));
      let prevSelectedValue = val$.value;

      const unsubscribe = this.store.subscribe(() => {
         const state: STATE = this.store.getState();
         const selectedValue = selector(state);

         if (!isEqual(selectedValue, prevSelectedValue)) {
            prevSelectedValue = selectedValue;
            val$.next(selectedValue);
         }
      });

      val$.subscribe({
         complete: unsubscribe
      });

      return val$;
   }
}
