import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem, SortBy } from '../../types/entity';
import { Exclusion } from '../../utils/exclusion';
import { Model } from '../../entities/model';
import { AbstractClass, Class, ClassListItem } from '../../entities/class';
import { GettextCatalogWrapper } from '../../ajs-upgraded-providers';
import { ExternalEntity } from '../../entities/externalEntity';
import { DisplayItemFactory, Value } from '../form/displayItemFactory';

@Component({
  selector: 'app-search-class-table-modal-content',
  template: `
      <table class="table table-sm" width="100%">
          <thead>
          <tr>
              <th class="name-col">
                  <sort-by-column-header [headerText]="'Name'"
                                         [columnName]="'name'"
                                         [model]="model"
                                         [sortBy]="sortBy"
                                         [filterExclude]="filterExclude"></sort-by-column-header>
              </th>
              <th class="model-col">
                  <sort-by-column-header [headerText]="'Model'"
                                         [columnName]="'model'"
                                         [model]="model"
                                         [sortBy]="sortBy"
                                         [filterExclude]="filterExclude"></sort-by-column-header>
              </th>
              <th class="description-col">
                  <sort-by-column-header [headerText]="'Description'"
                                         [columnName]="'description'"
                                         [model]="model"
                                         [sortBy]="sortBy"
                                         [filterExclude]="filterExclude"></sort-by-column-header>
              </th>
              <!-- Showing of super class is not implemented yet. -->
              <!-- <th style="width: 20%" translate>Super class</th> -->
              <th class="modified-at-col">
                  <sort-by-column-header [headerText]="'Modified at'"
                                         [columnName]="'modifiedAt'"
                                         [model]="model"
                                         [sortBy]="sortBy"
                                         [filterExclude]="filterExclude"></sort-by-column-header>
              </th>
              <th class="menu-col"></th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let searchResult of searchResults"
              id="{{searchResultID(searchResult)}}"
              [ngClass]="{'search-result': true, 'active': isSelected(searchResult)}"
              (click)="itemSelected.emit(searchResult)"
              title="{{itemTitle(searchResult)}}"
              key-control-selection>

              <td class="name-col">
                  <div>
                      <app-ajax-loading-indicator-small *ngIf="isLoadingSelection(searchResult)"></app-ajax-loading-indicator-small>
                      <highlight [text]="searchResult.label" [context]="model" [search]="searchText"></highlight>
                  </div>
                  <a [href]="model.linkToResource(searchResult.id)" target="_blank"
                     [innerHTML]="searchResult.id.compact | highlight: searchText"></a>
                  <div style="padding-top: 5px">
                      <app-status [status]="searchResult.status"></app-status>
                  </div>
              </td>
              <td class="model-col">
                  <div>
                      <highlight [text]="searchResult.definedBy.label" [context]="model" [search]="searchText"></highlight>
                  </div>
                  <div *ngIf="searchResult.definedBy.normalizedType">
                      {{searchResult.definedBy.normalizedType | translate}}
                  </div>
                  <div>
                      <span class="information-domains">
                        <span class="badge badge-light" *ngFor="let infoDomain of searchResult.definedBy.classifications">
                            {{showItemValue(infoDomain.label)}}
                        </span>
                      </span>
                  </div>
              </td>
              <td class="description-col">
                  <highlight [text]="searchResult.comment" [context]="model" [search]="searchText"></highlight>
              </td>
              <!-- Showing of super class is not implemented yet. -->
              <!--
              <td>
                {{$ctrl.model.linkToResource(searchResult.superClassOf)}}
              </td>
              -->
              <td class="modified-at-col">
                  {{showItemValue(searchResult.modifiedAt)}}
              </td>
              <td class="menu-col">
              </td>
          <tr>
          </tbody>
      </table>
  `
})
export class SearchClassTableModalContentComponent {
  @Input() sortBy: SortBy<ListItem>;
  @Input() filterExclude: Exclusion<ListItem>;
  @Input() model: Model;
  @Input() searchText: string;
  @Input() searchResults: ClassListItem[] = [];
  @Input() exclude: Exclusion<AbstractClass>;
  @Input() selectedItem?: ClassListItem;
  @Input() selection?: Class | ExternalEntity;
  @Output() itemSelected = new EventEmitter<ClassListItem | undefined>();

  constructor(private gettextCatalogWrapper: GettextCatalogWrapper,
              private displayItemFactory: DisplayItemFactory) {
  }

  isSelected(item?: AbstractClass): boolean {
    return this.selectedItem === item;
  }

  isLoadingSelection(item: ClassListItem): boolean {
    const selection = this.selection;
    return item === this.selectedItem && (!selection || (selection instanceof Class && !item.id.equals(selection.id)));
  }

  searchResultID(item: AbstractClass): string {
    return `${item.id.toString()}_search_class_link`;
  }

  itemTitle(item: AbstractClass): string | null {
    const disabledReason = this.exclude(item);
    if (!!disabledReason) {
      return this.gettextCatalogWrapper.gettextCatalog.getString(disabledReason);
    } else {
      return null;
    }
  }

  showItemValue(value: Value): string {
    return this.displayItemFactory.create({
      context: () => this.model,
      value: () => value
    }).displayValue;
  }
}