import { IHttpService, IPromise, IQService } from 'angular';
import * as moment from 'moment';
import { upperCaseFirst } from 'change-case';
import { Uri, Urn } from '../entities/uri';
import { Language } from '../types/language';
import { assertNever, requireDefined } from 'yti-common-ui/utils/object';
import * as frames from '../entities/frames';
import { FrameService } from './frameService';
import { GraphData, KnownModelType } from '../types/entity';
import { ImportedNamespace, Link, Model, ModelListItem } from '../entities/model';
import { apiEndpointWithName } from './config';
import { ClassService } from './classService';
import { PredicateService } from './predicateService';

export interface ModelService {
  getModels(): IPromise<ModelListItem[]>;

  getModelByUrn(urn: Uri | Urn): IPromise<Model>;

  getModelByPrefix(prefix: string): IPromise<Model>;

  createModel(model: Model): IPromise<any>;

  updateModel(model: Model): IPromise<any>;

  deleteModel(id: Uri): IPromise<any>;

  newModel(prefix: string, label: string, classifications: string[], organizations: string[], lang: Language[], type: KnownModelType, redirect?: Uri): IPromise<Model>;

  newModelRequirement(model: Model, resourceUri: string): IPromise<any>;

  newLink(title: string, description: string, homepage: Uri, lang: Language): IPromise<Link>;

  getAllImportableNamespaces(): IPromise<ImportedNamespace[]>;

  newNamespaceImport(namespace: string, prefix: string, label: string, lang: Language): IPromise<ImportedNamespace>;
}

export class DefaultModelService implements ModelService {

  constructor(private $http: IHttpService,
              private $q: IQService,
              private frameService: FrameService,
              private defaultClassService: ClassService,
              private defaultPredicateService: PredicateService) {
    'ngInject';
  }

  getModels(): IPromise<ModelListItem[]> {
    return this.$http.get<GraphData>(apiEndpointWithName('model'))
      .then(response => this.deserializeModelList(response.data!));
  }

  getModelByUrn(urn: Uri | Urn): IPromise<Model> {
    return this.$http.get<GraphData>(apiEndpointWithName('model'), { params: { id: urn.toString() } })
      .then(response => this.deserializeModelById(response.data!, urn));
  }

  getModelByPrefix(prefix: string): IPromise<Model> {
    return this.$http.get<GraphData>(apiEndpointWithName('model'), { params: { prefix } })
      .then(response => this.deserializeModelByPrefix(response.data!, prefix));
  }

  createModel(model: Model): IPromise<any> {
    return this.$http.put<{ identifier: Urn }>(apiEndpointWithName('model'), model.serialize())
      .then(response => {
        model.unsaved = false;
        model.version = response.data!.identifier;
        model.createdAt = moment().utc();
        model.modifiedAt = moment().utc();
      });
  }

  updateModel(model: Model): IPromise<any> {
    return this.$http.post<{ identifier: Urn }>(apiEndpointWithName('model'), model.serialize(), { params: { id: model.id.uri } })
      .then(response => {
        model.version = response.data!.identifier;
        model.modifiedAt = moment().utc();
      });
  }

  deleteModel(id: Uri): IPromise<any> {
    const modelId: string = id.uri;
    this.defaultClassService.clearCachedClasses(modelId);
    this.defaultPredicateService.clearCachedPredicates(modelId);
    return this.$http.delete(apiEndpointWithName('model'), { params: { id: modelId } });
  }

  newModel(prefix: string, label: string, classifications: string[], organizations: string[], lang: Language[], type: KnownModelType, redirect?: Uri): IPromise<Model> {

    function mapEndpoint() {
      switch (type) {
        case 'library':
          return 'modelCreator';
        case 'profile':
          return 'profileCreator';
        default:
          return assertNever(type, 'Unknown type: ' + type);
      }
    }

    return this.$http.get<GraphData>(apiEndpointWithName(mapEndpoint()), {
      params: {
        prefix,
        label: upperCaseFirst(label),
        lang: lang[0],
        langList: lang.join(' '),
        redirect: redirect && redirect.uri,
        serviceList: classifications.join(' '),
        orgList: organizations.join(' ')
      }
    })
      .then(response => this.deserializeModel(response.data!))
      .then((model: Model) => {
        model.unsaved = true;
        return model;
      });
  }

  newModelRequirement(model: Model, resourceUri: string): IPromise<any> {
    return this.$http.put<{ identifier: Urn }>(apiEndpointWithName('newModelRequirement'), model.serialize(), { params: { model: model.id.uri, resource: resourceUri} })
      .then(response => {
        // TODO: Handling of the returned model
      });
  }

  newLink(title: string, description: string, homepage: Uri, lang: Language) {
    const graph = {
      title: {
        [lang]: title
      },
      description: {
        [lang]: description
      },
      homepage: homepage.url
    };

    const frameObject = frames.modelFrame({ '@graph': graph, '@context': {} });

    return this.$q.when(new Link(graph, {}, frameObject));
  }

  getAllImportableNamespaces(): IPromise<ImportedNamespace[]> {
    return this.$http.get<GraphData>(apiEndpointWithName('listNamespaces'))
      .then(response => this.deserializeImportedNamespaces(response.data!));
  }

  newNamespaceImport(namespace: string, prefix: string, label: string, lang: Language): IPromise<ImportedNamespace> {
    return this.$http.get<GraphData>(apiEndpointWithName('modelRequirementCreator'), { params: { namespace, prefix, label, lang } })
      .then(response => this.deserializeImportedNamespace(response.data!));
  }

  private deserializeModelList(data: GraphData): IPromise<ModelListItem[]> {
    return this.frameService.frameAndMapArray(data, frames.modelListFrame(data), () => ModelListItem);
  }

  private deserializeModel(data: GraphData): IPromise<Model> {
    return this.frameService.frameAndMap(data, false, frames.modelFrame(data), () => Model).then(requireDefined);
  }

  private deserializeModelById(data: GraphData, id: Uri | Urn): IPromise<Model> {
    return this.frameService.frameAndMap(data, true, frames.modelFrame(data, { id }), () => Model).then(requireDefined);
  }

  private deserializeModelByPrefix(data: GraphData, prefix: string): IPromise<Model> {
    return this.frameService.frameAndMap(data, true, frames.modelFrame(data, { prefix }), () => Model).then(requireDefined);
  }

  private deserializeImportedNamespace(data: GraphData): IPromise<ImportedNamespace> {
    return this.frameService.frameAndMap(data, false, frames.namespaceFrame(data), () => ImportedNamespace).then(requireDefined);
  }

  private deserializeImportedNamespaces(data: GraphData): IPromise<ImportedNamespace[]> {
    return this.frameService.frameAndMapArray(data, frames.namespaceFrame(data), () => ImportedNamespace);
  }
}
