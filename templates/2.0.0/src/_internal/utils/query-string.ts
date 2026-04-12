export function addQueryParamToPath(path: string, key: string, value: string): string {
   // Split the path into base and query parts
   const [basePath, queryString] = path.split('?');

   // Create or update the search parameters
   const searchParams = new URLSearchParams(queryString);
   searchParams.set(key, value);

   // Return the updated path
   return `${basePath}?${searchParams.toString()}`;
}
