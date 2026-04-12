export function readLocalStorage<T>(key: string, defaultValue?: T): T {
   const value = localStorage.getItem(key);
   if (value == null) {
      return defaultValue as T;
   }
   try {
      if (typeof defaultValue === 'string') {
         return value as unknown as T;
      } else if (typeof defaultValue === 'number') {
         return +value as unknown as T;
      } else {
         return JSON.parse(value) as T;
      }
   } catch (e) {
      console.error('Invalid value in local storage for key:', key, e);
      return defaultValue as T;
   }
}

export function writeLocalStorage(key: string, value: unknown) {
   if (value != null) {
      localStorage.setItem(key, typeof value == 'string' ? value : JSON.stringify(value));
   } else {
      localStorage.removeItem(key);
   }
}

export function getFilterStorageKey(entityName: string) {
   return `filter ${entityName}`;
}

export function getSortingStorageKey(entityName: string) {
   return `sorting ${entityName}`;
}
