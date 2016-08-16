import { EditableComponent } from './editableComponent.po';
import { ElementFinder } from 'protractor';
import Key = protractor.Key;

export class MultipleEditableComponent extends EditableComponent {

  constructor(element: ElementFinder) {
    super(element);
  }

  static byElementNameAndTitleLocalizationKey(elementName: string, title: string) {
    return new MultipleEditableComponent(element(by.css(`${elementName}[data-title="${title}"]`)));
  }

  clearExistingValues() {
    this.editableElement.all(by.css('.delete-item')).each(item => item.click());
  }

  setItems(values: string[]) {
    this.clearExistingValues();
    this.addItems(values);
  }

  addItem(value: string) {
    this.setValue(value + Key.ESCAPE + Key.ENTER + Key.ESCAPE); // dismiss autocomplete and add and dismiss
  }

  addItems(values: string[]) {
    for (const value of values) {
      this.addItem(value);
    }
  }
}
