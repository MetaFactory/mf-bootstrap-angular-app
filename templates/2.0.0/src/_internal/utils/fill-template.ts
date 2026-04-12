export function processTemplate(template: string, data: unknown) {
   return template?.replace(/\{\{([\w\.]+)\}\}/g, (match, path) => {
      const levels = path.split('.');
      let currentValue = data;

      for (let i = 0; i < levels.length; i++) {
         if (currentValue === null || currentValue === undefined) {
            return match; // Return original placeholder if path is broken
         }
         currentValue = (currentValue as Record<string, unknown>)[levels[i]];
      }

      return (currentValue === undefined ? match : (currentValue as any)) ?? '';
   });
}
