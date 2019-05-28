import { ChoosePredicateTypeModal } from './choosePredicateTypeModal';
import { CopyPredicateModal } from './copyPredicateModal';
import { SearchConceptModal } from './searchConceptModal';
import { SearchClassModal } from './searchClassModal';
import { SearchClassTableModal } from './searchClassTableModal';
import { SearchPredicateModal } from './searchPredicateModal';
import { SearchPredicateTableModal } from './searchPredicateTableModal';
import { AddPropertiesFromClassModal } from './addPropertiesFromClassModal';
import { ShowClassInfoModal } from './showClassInfoModal';
import { ClassFormComponent } from './classForm';
import { EditableMultipleComponent } from './editableMultiple';
import { ClassViewComponent } from './classView';
import { PredicateViewComponent } from './predicateView';
import { DefinedByComponent } from './definedBy';
import { UriSelectComponent } from './uriSelect';
import { EditableConstraintComponent } from './editableConstraint';
import { EditableMultipleUriSelectComponent } from './editableMultipleUriSelect';
import { EditableMultipleDataTypeInputComponent } from './editableMultipleDataTypeInput';
import { EditableMultipleLanguageSelectComponent } from './editableMultipleLanguageSelect';
import { EditableReferenceDataSelectComponent } from './editableReferenceDataSelect';
import { PredicateFormComponent } from './predicateForm';
import { PropertyViewComponent } from './propertyView';
import { PropertyPredicateViewComponent } from './propertyPredicateView';
import { EditableRangeSelectComponent } from './editableRangeSelect';
import { SelectionViewComponent } from './selectionView';
import { SubjectViewComponent } from './subjectView';
import { VisualizationViewComponent } from './visualizationView';

import { componentDeclaration } from 'app/utils/angular';
import { module as mod } from './module';
export { module } from './module';

mod.component('classForm', componentDeclaration(ClassFormComponent));
mod.component('classView', componentDeclaration(ClassViewComponent));
mod.component('definedBy', componentDeclaration(DefinedByComponent));
mod.component('uriSelect', componentDeclaration(UriSelectComponent));
mod.component('editableConstraint', componentDeclaration(EditableConstraintComponent));
mod.component('editableMultiple', componentDeclaration(EditableMultipleComponent));
mod.component('editableMultipleUriSelect', componentDeclaration(EditableMultipleUriSelectComponent));
mod.component('editableMultipleDataTypeInput', componentDeclaration(EditableMultipleDataTypeInputComponent));
mod.component('editableMultipleLanguageSelect', componentDeclaration(EditableMultipleLanguageSelectComponent));
mod.component('editableReferenceDataSelect', componentDeclaration(EditableReferenceDataSelectComponent));
mod.component('predicateForm', componentDeclaration(PredicateFormComponent));
mod.component('predicateView', componentDeclaration(PredicateViewComponent));
mod.component('propertyView', componentDeclaration(PropertyViewComponent));
mod.component('propertyPredicateView', componentDeclaration(PropertyPredicateViewComponent));
mod.component('editableRangeSelect', componentDeclaration(EditableRangeSelectComponent));
mod.component('selectionView', componentDeclaration(SelectionViewComponent));
mod.component('subjectView', componentDeclaration(SubjectViewComponent));
mod.component('visualizationView', componentDeclaration(VisualizationViewComponent));

mod.service('choosePredicateTypeModal', ChoosePredicateTypeModal);
mod.service('copyPredicateModal', CopyPredicateModal);
mod.service('addPropertiesFromClassModal', AddPropertiesFromClassModal);
mod.service('searchClassModal', SearchClassModal);
mod.service('searchClassTableModal', SearchClassTableModal);
mod.service('searchConceptModal', SearchConceptModal);
mod.service('searchPredicateModal', SearchPredicateModal);
mod.service('searchPredicateTableModal', SearchPredicateTableModal);
mod.service('showClassInfoModal', ShowClassInfoModal);
