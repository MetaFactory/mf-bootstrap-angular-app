import { Component, ContentChildren, QueryList } from '@angular/core'
import { TabComponent } from './tab/tab.component'

@Component({
  selector: 'app-tab-container',
  standalone: false,
  templateUrl: './tab-container.component.html'
})
export class TabContainerComponent {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter((tab) => tab.isActive)
    if (activeTabs.length === 0 && this.tabs.first) {
      this.selectTab(this.tabs.first)
    }
  }

  selectTab(selectedTab: TabComponent) {
    this.tabs.forEach((tab) => (tab.isActive = false))
    selectedTab.isActive = true
  }
}
