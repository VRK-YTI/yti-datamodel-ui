import { createStory, createClickNextCondition, createExplicitNextCondition } from '../../contract';
import { editableByTitle, child, editableFocus } from '../../selectors';
import { editableMarginInColumn } from '../../utils';

export function focusClass(parent: () => JQuery) {

  const focusClassElement = child(parent, 'form');

  return createStory({
    title: 'Class is here',
    popover: {
      element: focusClassElement,
      position: 'top-right'
    },
    focus: {
      element: focusClassElement,
      denyInteraction: true
    },
    nextCondition: createExplicitNextCondition()
  });
}

export function focusOpenProperty(parent: () => JQuery) {

  const focusOpenPropertyElement = child(parent, 'property-view div[ng-if="ctrl.isOpen()"]');

  return createStory({
    title: 'Property is here',
    popover: {
      element: focusOpenPropertyElement,
      position: 'top-right'
    },
    focus: {
      element: focusOpenPropertyElement,
      denyInteraction: true,
      margin: { left: 10, right: 10, top: 10, bottom: 10 }
    },
    nextCondition: createExplicitNextCondition()
  });
}

export function selectAssociationTarget(parent: () => JQuery) {

  const enterAssociationTargetElement = editableByTitle(parent, 'Value class');
  const enterAssociationTargetSelectButtonElement = child(enterAssociationTargetElement, 'button');

  return createStory({

    title: 'Select association target',
    popover: {
      element: enterAssociationTargetSelectButtonElement,
      position: 'right-down'
    },
    focus: { element: enterAssociationTargetSelectButtonElement },
    nextCondition: createClickNextCondition(enterAssociationTargetSelectButtonElement)
  });
}

export function focusAssociationTarget(parent: () => JQuery) {

  const enterAssociationTargetElement = editableByTitle(parent, 'Value class');
  const enterAssociationTargetSelectFocusElement = editableFocus(enterAssociationTargetElement);

  return createStory({

    title: 'Association target is here',
    popover: {
      element: enterAssociationTargetSelectFocusElement,
      position: 'top-right'
    },
    focus: {
      element: enterAssociationTargetSelectFocusElement,
      margin: editableMarginInColumn,
      denyInteraction: true
    },
    nextCondition: createExplicitNextCondition()
  });
}
