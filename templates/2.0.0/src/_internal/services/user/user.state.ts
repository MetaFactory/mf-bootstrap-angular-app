import type { EntityState } from '../../types';
import { insatiateEntityState } from '../entity/entity.state';
import type { Account, UserListItemDto } from './user';

export const entityName = 'user';

export type UserState = EntityState<UserListItemDto> & {
   account: Account | null;
};

export const initialState: UserState = {
   entity: insatiateEntityState(entityName),
   account: null
};
