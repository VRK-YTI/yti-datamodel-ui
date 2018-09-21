import { createStory, createExpectedStateNextCondition, Story } from 'app/help/contract';
import { modal, child } from 'app/help/selectors';
import { confirm } from 'app/help/pages/modal/modalHelp.po';
import { AddPropertiesFromClassModalController } from 'app/components/editor/addPropertiesFromClassModal';
import { arraysAreEqual } from 'yti-common-ui/utils/array';
import { getModalController, onlyProperties } from 'app/help/utils';

const selectPropertiesElement = child(modal, '.properties');

export function selectProperties(title: string, expectProperties: string[]) {

  return createStory({

    title: { key: title },
    content: { key: title + ' info' },
    popover: { element: selectPropertiesElement, position: 'bottom-right' },
    focus: { element: selectPropertiesElement },
    nextCondition: createExpectedStateNextCondition(() => {

      const ctrl = getModalController<AddPropertiesFromClassModalController>();

      if (!expectProperties) {
        return true;
      }

      return arraysAreEqual(Object.values(ctrl.selectedProperties.map(p => p.predicateId.uri)), expectProperties);
    }),
    initialize: () => {
      if (expectProperties) {
        try {
          const ctrl = getModalController<AddPropertiesFromClassModalController>();
          onlyProperties(ctrl.selectedProperties, expectProperties);
        } catch (e) {
          console.log(e);
          return false;
        }
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
