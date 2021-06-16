import { expandContextWithKnownModels } from 'app/utils/entity';
import { index } from 'yti-common-ui/utils/array';
import { requireDefined } from 'yti-common-ui/utils/object';
import * as frames from 'app/entities/frames';
import { FrameService } from './frameService';
import { GraphData } from 'app/types/entity';
import { ModelPositions, VisualizationClass, DefaultVisualizationClass } from 'app/entities/visualization';
import { Model } from 'app/entities/model';
import { IPromise, IQService, IHttpService } from 'angular';
import { normalizeAsArray } from 'yti-common-ui/utils/array';
import { apiEndpointWithName } from './config';

export interface VisualizationService {
  getVisualization(model: Model): IPromise<ClassVisualization>;
  updateModelPositions(model: Model, modelPositions: ModelPositions): IPromise<any>;
}

export class DefaultVisualizationService implements VisualizationService {

  constructor(private $http: IHttpService, private $q: IQService, private frameService: FrameService) {
    'ngInject';
  }

  getVisualization(model: Model) {
    return this.$q.all([this.getVisualizationClasses(model), this.getModelPositions(model)])
      .then(([classes, positions]) => new ClassVisualization(classes, positions));
  }

  private getVisualizationClasses(model: Model) {

    const params = {
      graph: model.id.uri
    };

    return this.$http.get<GraphData>(apiEndpointWithName('exportModel'), { params })
      .then(expandContextWithKnownModels(model))
      .then(response => {
        const data = response.data!;

        // get all classes from exportModel and map properties
        const classes = data['@graph']
          .filter((graph: any) => ['rdfs:Class', 'sh:NodeShape'].includes(graph['@type']))
          .map((cls: any) => {
            const propIds = normalizeAsArray(cls.property);
 
            cls.name = this.mapLocalizedValues(cls.name);
            cls.description = this.mapLocalizedValues(cls.description);
            
            cls.property = propIds.map((id: any) => {
              const property = data['@graph'].find((element: any) => element['@id'] === id);

              if (!property) {
                return null;
              }
              
              property.name = this.mapLocalizedValues(property.name);
              property.description = this.mapLocalizedValues(property.description);

              // delete memberOf because it is not needed in visualization
              delete property.memberOf;
              
              return Object.assign({}, ...this.removePrefixes(property));
            })
            .filter(Boolean);
            
            return Object.assign({}, ...this.removePrefixes(cls));
        })
        
        try {
          return normalizeAsArray(classes).map(element => {
            return new DefaultVisualizationClass(element, data['@context'], null);
          });
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
  }

  private mapLocalizedValues(property: {'@language': string, '@value': string} | {'@language': string, '@value': string}[]) {
    if (!property) {
      return {}
    }
    const localizations = normalizeAsArray(property)
    const mappedLocalizations: any = {};
    localizations.map((localization: {[lang: string]: string}) => {
      mappedLocalizations[localization['@language']] = localization['@value'];
    });
    return mappedLocalizations;
  }

  // remove prefixes from keys, e.g. sh:order -> order
  private removePrefixes(obj: any) {
    return Object.keys(obj).map(key => {
      const newKey = key.replace(/^\w+:/, '');
      return {[newKey]: obj[key]};
    });
  } 

  private getModelPositions(model: Model) {
    return this.$http.get<GraphData>(apiEndpointWithName('modelPositions'), { params: { model: model.id.uri } })
      .then(expandContextWithKnownModels(model))
      .then(response => this.deserializeModelPositions(response.data!), _err => this.newModelPositions(model));
  }

  updateModelPositions(model: Model, modelPositions: ModelPositions) {
    return this.$http.put(apiEndpointWithName('modelPositions'), modelPositions.serialize(), { params: { model: model.id.uri } });
  }

  newModelPositions(model: Model) {
    const frame: any = frames.modelPositionsFrame({ '@context': model.context });
    return new ModelPositions([], frame['@context'], frame);
  }

  private deserializeModelPositions(data: GraphData): IPromise<ModelPositions> {
    return this.frameService.frameAndMapArrayEntity(data, frames.modelPositionsFrame(data), () => ModelPositions);
  }
}

export class ClassVisualization {

  private classes: Map<string, VisualizationClass>;

  constructor(classes: VisualizationClass[], public positions: ModelPositions) {
    this.classes = index(classes, klass => klass.id.toString());
  }

  get size() {
    return this.classes.size;
  }

  removeClass(classId: string) {
    this.classes.delete(classId);
  }

  addOrReplaceClass(klass: VisualizationClass) {
    this.classes.set(klass.id.toString(), klass);
  }

  getClasses() {
    return Array.from(this.classes.values());
  }

  hasClass(classId: string) {
    return this.classes.has(classId);
  }

  getClassById(classId: string) {
    return requireDefined(this.classes.get(classId));
  }

  getClassIds() {
    return new Set(this.classes.keys());
  }

  getClassIdsWithoutPosition() {
    return Array.from(this.classes.values()).filter(c => !this.positions.isClassDefined(c.id)).map(c => c.id);
  }

  addPositionChangeListener(listener: () => void) {
    this.positions.addChangeListener(listener);
  }
}
