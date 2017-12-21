import { createStory, createExpectedStateNextCondition, Story } from 'app/help/contract';
import { modalBody, child, modal } from 'app/help/selectors';
import { confirm } from 'app/help/pages/modal/modalHelp.po';
import { AddPropertiesFromClassModalController } from 'app/components/editor/addPropertiesFromClassModal';
import { arraysAreEqual } from 'yti-common-ui/utils/array';
import { getModalController, propertyIdIsSame, onlyProperties } from 'app/help/utils';

const selectPropertiesElement = modalBody;

export function selectProperties(title: string, expectProperties: string[]) {

  return createStory({

    title: title,
    content: title + ' info',
    popover: { element: selectPropertiesElement, position: 'left-down' },
    focus: { element: selectPropertiesElement },
    nextCondition: createExpectedStateNextCondition(() => {

      const ctrl = getModalController<AddPropertiesFromClassModalController>();

      if (!expectProperties) {
        return true;
      }

      return arraysAreEqual(Object.values(ctrl.selectedProperties.map(p => p.internalId.uuid)), expectProperties, propertyIdIsSame);
    }),
    initialize: () => {
      if (expectProperties) {
        const ctrl = getModalController<AddPropertiesFromClassModalController>();
        onlyProperties(ctrl.selectedProperties, expectProperties);
      }
      return true;
    },
    reversible: true
  });
}

export function confirmProperties(navigates: boolean) {
  return confirm(child(modal, '.add-properties-from-class'), navigates);
}

export function selectAndConfirmPropertiesItems(title: string, navigates: boolean, properties: string[]): Story[] {
  return [
    selectProperties(title, properties),
    confirmProperties(navigates)
  ];
}