import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralErrorComponent } from '../pages/general-error/general-error.component';
import { LoginFailedComponent } from '../pages/login-failed/login-failed.component';
import { LoginComponent } from '../pages/login/login.component';
import { ExtractPropertyPipe, MarkdownPipe } from '../pipes';
import { FormatHoursPipe } from '../pipes/FormatHoursPipe';
import { BackdropComponent } from './backdrop/backdrop.component';
import { ButtonComponent } from './button/button.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ColumnComponent } from './column/column.component';
import { CustomModalHostComponent } from './custom-modal-host/custom-modal-host.component';
import { DataTablePanelComponent } from './data-table-panel/data-table-panel.component';
import { DataTableComponent } from './data-table/data-table.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { EntityCardListComponent } from './entity-card-list/entity-card-list.component';
import { EntityEditPanelComponent } from './entity-edit-panel/entity-edit-panel.component';
import { EntityFieldEditComponent } from './entity-edit-panel/entity-field-edit/entity-field-edit.component';
import { EntityFieldViewComponent } from './entity-field-view/entity-field-view.component';
import { EntityPanelComponent } from './entity-panel/entity-panel.component';
import { EntityViewComponent } from './entity-panel/entity-view/entity-view.component';
import { FieldsEditPanelComponent } from './fields-edit-panel/fields-edit-panel.component';
import { FilterBarFieldComponent } from './filter-bar/filter-bar-field/filter-bar-field.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { FreeFormModalComponent } from './free-form-modal/free-form-modal.component';
import { IconButtonComponent } from './icon-button/icon-button.component';
import { IconComponent } from './icon/icon.component';
import { InputBooleanComponent } from './input-boolean/input-boolean.component';
import { InputDateComponent } from './input-date/input-date.component';
import { InputTextComponent } from './input-text/input-text.component';
import { InputTimeComponent } from './input-time/input-time.component';
import { AccountMenuComponent } from './layout/account-menu/account-menu.component';
import { LanguageMenuComponent } from './layout/language-menu/language-menu.component';
import { LayoutComponent } from './layout/layout.component';
import { LinkComponent } from './layout/link/link.component';
import { NavComponent } from './layout/nav/nav.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ToolbarComponent } from './layout/toolbar/toolbar.component';
import { MenuItemComponent } from './menu/menu-item/menu-item.component';
import { MenuComponent } from './menu/menu.component';
import { ModalPreferencesComponent } from './modal-preferences/modal-preferences.component';
import { ModalComponent } from './modal/modal.component';
import { MonthSelectorComponent } from './month-selector/month-selector.component';
import { NarrowContainerPageComponent } from './narrow-container-page/narrow-container-page.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { PopoverComponent } from './popover/popover.component';
import { ProgressStatusComponent } from './progress-status/progress-status.component';
import { ResponsiveDataTableComponent } from './responsive-data-table/responsive-data-table.component';
import { RowComponent } from './row/row.component';
import { SelectComponent } from './select/select.component';
import { SidebarSliderComponent } from './sidebar-slider/sidebar-slider.component';
import { SpacerComponent } from './spacer/spacer.component';
import { SplitterPanelComponent } from './splitter-panel/splitter-panel.component';
import { SwitchComponent } from './switch/switch.component';
import { TabContainerComponent } from './tab-container/tab-container.component';
import { TabComponent } from './tab-container/tab/tab.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { ToastifyComponent } from './toastify/toastify.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { WeekSelectorComponent } from './week-selector/week-selector.component';

const components = [
   // Pipes
   ExtractPropertyPipe,
   FormatHoursPipe,
   MarkdownPipe,

   // Components
   TimePickerComponent,
   ButtonComponent,
   IconButtonComponent,
   EntityFieldEditComponent,
   DataTableComponent,
   EntityEditPanelComponent,
   EntityViewComponent,
   FilterBarComponent,
   FilterBarFieldComponent,
   SelectComponent,
   InputDateComponent,
   CalendarComponent,
   SpacerComponent,
   SidebarSliderComponent,
   LayoutComponent,
   NavComponent,
   SidebarComponent,
   ToolbarComponent,
   NotFoundComponent,
   ProgressStatusComponent,
   RowComponent,
   TabContainerComponent,
   TabComponent,
   ToastifyComponent,
   InputTextComponent,
   NarrowContainerPageComponent,
   AccountMenuComponent,
   ColumnComponent,
   BackdropComponent,
   PopoverComponent,
   MenuComponent,
   MenuItemComponent,
   LanguageMenuComponent,
   CheckboxComponent,
   ModalComponent,
   ModalPreferencesComponent,
   SwitchComponent,
   LoginComponent,
   GeneralErrorComponent,
   LoginFailedComponent,
   EntityCardListComponent,
   ResponsiveDataTableComponent,
   SplitterPanelComponent,
   DynamicFormComponent,
   DataTablePanelComponent,
   EntityPanelComponent,
   IconComponent,
   FreeFormModalComponent,
   CustomModalHostComponent,
   InputBooleanComponent,
   FieldsEditPanelComponent,
   WeekSelectorComponent,
   MonthSelectorComponent,
   TooltipComponent,
   InputTimeComponent,
   LinkComponent,
   EntityFieldViewComponent,
   PaginatorComponent
];

@NgModule({
   imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule],
   declarations: components,
   exports: components
})
export class CommonComponentsModule {}
