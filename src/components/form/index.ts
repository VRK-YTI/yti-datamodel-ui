import { DisplayItemFactory } from './displayItemFactory';

const mod = angular.module('iow.components.form', ['iow.services']);
export = mod.name;

import './bootstrapInput';
import './curieInput';
import './editable';
import './editableEntityButtons';
import './errorMessages';
import './href';
import './idInput';
import './localizedInput';
import './modelLanguageChooser';
import './namespaceInput';
import './nonEditable';
import './restrictDuplicates';
import './stateSelect';
import './valueSelect';

mod.service('displayItemFactory', DisplayItemFactory);
