// utils.service.ts
import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class Utils {
   static CHART_COLORS = {
      red: 'rgb(255, 99, 132)',
      orange: 'rgb(255, 159, 64)',
      yellow: 'rgb(255, 205, 86)',
      green: 'rgb(75, 192, 192)',
      blue: 'rgb(54, 162, 235)',
      purple: 'rgb(153, 102, 255)',
      grey: 'rgb(201, 203, 207)'
   };

   static months({ count }: { count: number }): string[] {
      return Array.from({ length: count }, (_, i) =>
         new Date(0, i + 1).toLocaleString('default', { month: 'short' })
      );
   }

   static rand(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1) + min);
   }

   static numbers(config: any) {
      var cfg = config || {};
      var min = cfg.min ?? 0;
      var max = cfg.max ?? 100;
      var from = cfg.from ?? [];
      var count = cfg.count ?? 8;
      var decimals = cfg.decimals ?? 8;
      var continuity = cfg.continuity ?? 1;
      var dfactor = Math.pow(10, decimals) || 0;
      var data = [];
      var i, value;

      for (i = 0; i < count; ++i) {
         value = (from[i] || 0) + this.rand(min, max);
         if (this.rand(-100, 100) <= continuity) {
            data.push(Math.round(dfactor * value) / dfactor);
         } else {
            data.push(null);
         }
      }

      return data;
   }
}
