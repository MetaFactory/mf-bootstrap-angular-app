import { Injectable, Injector } from '@angular/core';
import { StoreServiceBase } from '@common/services';
import { dynamicServices } from './dynamic-services';
import { RootState, dynamicSlices, rootReducer } from './rootReducer';

@Injectable({
   providedIn: 'root'
})
export class StoreService extends StoreServiceBase<RootState> {
   constructor(injector: Injector) {
      super(rootReducer, dynamicSlices, dynamicServices, injector);
   }
}
