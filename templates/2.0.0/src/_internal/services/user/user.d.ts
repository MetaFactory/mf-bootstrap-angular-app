import type { Entity, EntityListItemDto, SelectOption } from '../../types';

export type UserListItemDto = EntityListItemDto & {
   version: number;
   date: string;
   amount: number;
   description: string;
   expectedRemainingPoints: number;
   task: SelectOption;
   story: SelectOption;
   project: SelectOption;
   employee: SelectOption;
};

export type UserDto = Entity & {};

export type AuthenticateResponse = {
   id_token: string;
};

export type Account = {
   activated: boolean;
   authorities: string[];
   createdBy: string;
   createdDate: string;
   email: string;
   firstName: string;
   id: number | string;
   imageUrl: string;
   langKey: string;
   lastModifiedBy: string;
   lastModifiedDate: string;
   lastName: string;
   login: string;
};
