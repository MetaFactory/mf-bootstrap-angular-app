import { generateDynamicEntitySlices } from '@common/services';
import { generalReducer } from '@common/services/general/general.reducer';
import { userReducer } from '@common/services/user/user.reducer';
import { Reducer, combineReducers } from '@reduxjs/toolkit';
import { dynamicServices } from './dynamic-services';

export const dynamicSlices = generateDynamicEntitySlices(dynamicServices);
const dynamicReducers = dynamicSlices.reduce(
   (reducers, slice) => {
      reducers[slice.name] = slice.reducer;
      return reducers;
   },
   {} as { [name: string]: Reducer }
);

export const rootReducer = combineReducers({
   // core reducers
   ...generalReducer,
   ...userReducer,

   ...dynamicReducers
});

export type RootState = ReturnType<typeof rootReducer>;
export type GetStateFunction = () => RootState;
