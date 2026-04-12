import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { entityReducerBase } from '../entity/entity.reducer';
import type { Account, UserListItemDto } from './user';
import { UserState, entityName, initialState } from './user.state';

export const userSlice = createSlice({
   name: entityName,
   initialState,
   reducers: {
      ...entityReducerBase<UserListItemDto, UserState>(),

      accountSet: (state, action: PayloadAction<Account>) => {
         state.account = action.payload;
      }
   }
});

export const userReducer = { [entityName]: userSlice.reducer };
export const { accountSet } = userSlice.actions;
