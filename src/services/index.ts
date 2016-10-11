import { ClassService } from './classService';
import { VocabularyService } from './vocabularyService';
import { GroupService } from './groupService';
import { LanguageService } from './languageService';
import { LocationService } from './locationService';
import { ModelService } from './modelService';
import { PredicateService } from './predicateService';
import { SearchService } from './searchService';
import { UsageService } from './usageService';
import { UserService } from './userService';
import { ValidatorService } from './validatorService';
import { HistoryService } from './historyService';
import { EntityLoaderService } from './entityLoader';
import { ResetService } from './resetService';
import { SessionService } from './sessionService';
import { FrameService } from './frameService';

import { module as mod }  from './module';
export default mod.name;

mod.service('classService', ClassService);
mod.service('vocabularyService', VocabularyService);
mod.service('groupService', GroupService);
mod.service('languageService', LanguageService);
mod.service('locationService', LocationService);
mod.service('modelService', ModelService);
mod.service('predicateService', PredicateService);
mod.service('searchService', SearchService);
mod.service('usageService', UsageService);
mod.service('userService', UserService);
mod.service('validatorService', ValidatorService);
mod.service('historyService', HistoryService);
mod.service('resetService', ResetService);
mod.service('entityLoaderService', EntityLoaderService);
mod.service('sessionService', SessionService);
mod.service('frameService', FrameService);
