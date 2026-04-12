export function capitalize(str: string | null | undefined) {
   if (!str || typeof str !== 'string') {
      return str;
   }
   return str.charAt(0).toUpperCase() + str.slice(1);
}

export function upperFirst(str: string) {
   if (!str || typeof str !== 'string') {
      return '';
   }

   return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toggleValue<T = string | number>(arr: T[], value: T) {
   const index = arr.indexOf(value);
   if (index === -1) {
      arr.push(value); // If the value is not found, add it
   } else {
      arr.splice(index, 1); // If the value is found, remove it
   }
}

export const isEmpty = (obj: any) => {
   for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
         return false;
      }
   }
   return true;
};
