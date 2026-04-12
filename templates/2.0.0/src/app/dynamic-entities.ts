import { userDataTableSchema, userEntityViewSchema } from 'src/schema';

export const dynamicForms = [userDataTableSchema, userEntityViewSchema];

dynamicForms.forEach((form) => Object.freeze(form));
