import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { AuthorizationManagerServiceWrapper, ConfigServiceWrapper, ModelServiceWrapper } from "app/ajs-upgraded-providers";
import { Config } from "app/entities/config";
import { Model } from "app/entities/model";
import { EditorContainer, View } from "../model/modelControllerService";
import { ModelService } from "app/services/modelService";
import { LanguageService } from "app/services/languageService";
import { Language } from "app/types/language";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthorizationManagerService } from "app/services/authorizationManagerService";
import { ErrorModalService } from "yti-common-ui/components/error-modal.component";
import { MdEditorOption } from "ngx-markdown-editor";

@Component({
  selector: 'model-documentation',
  styleUrls: ['./model-documentation.component.scss'],
  templateUrl: './model-documentation.component.html',
})
export class ModelDocumentationComponent implements OnInit, OnDestroy, OnChanges, View {

  @Input() parent: EditorContainer;

  @Input() model: Model | null;
  modelInEdit: Model | null = null;

  @Output() updated: EventEmitter<Model> = new EventEmitter();

  editorMode: 'editor' | 'preview' = 'preview';
  config: Config;

  canEdit = false; // permissions to edit?
  editing = false; // editor in edit mode
  persisting = false; // in process of saving

  // model language currently selected in the UI
  modelLanguage: Language;
  // which language should the editor bind to,
  // varies between modelLanguage and fallbackLanguage
  activeModelLanguage: Language;
  // selected model language, or a fallback language if there's no content
  fallbackModelLanguage: Language;

  options: MdEditorOption = {
    enablePreviewContentClick: true,
    markedjsOpt: {
      breaks: true
    }
  };

  destroy$: Subject<boolean> = new Subject<boolean>();

  private modelService: ModelService;
  private authorizationManagerService: AuthorizationManagerService;

  constructor(
    private configServiceWrapper: ConfigServiceWrapper,
    modelServiceWrapper: ModelServiceWrapper,
    // TODO: hybrid angular app problem: this should be a wrapper,
    // or the other services shouldn't be wrappers?
    private languageService: LanguageService,
    authorizationManagerServiceWrapper: AuthorizationManagerServiceWrapper,
    private errorModalService: ErrorModalService
  ) {
    this.modelService = modelServiceWrapper.modelService;
    this.authorizationManagerService = authorizationManagerServiceWrapper.authorizationManagerService;
  }

  ngOnInit() {
    this.parent.registerView(this);

    this.configServiceWrapper.configService
      .getConfig()
      .then(config => {
        this.config = config;
      });

    this.select(this.model);

    this.updateModelLanguage();
    this.languageService.modelLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateModelLanguage();
      });

    this.canEdit = this.model ?
      this.authorizationManagerService.canEditModel(this.model) :
      false;
  }

  updateModelLanguage() {
    this.modelLanguage = this.fallbackModelLanguage = this.model ?
      this.languageService.getModelLanguage(this.model) :
      this.languageService.getModelLanguage();

    // if current language has no content, for viewing prefer a
    // language that has content
    if (this.modelInEdit &&
        (!this.modelInEdit.documentation[this.modelLanguage] ||
        !this.modelInEdit.documentation[this.modelLanguage].length)) {
      // take list of languages from model as potential fallbacks,
      // and sort them to prefer fi
      const fallbacks: Language[] =
        (this.model && this.model.language && this.model.language.length) ?
        this.model.language : ['fi'];
      fallbacks.sort((a, b) => b === 'fi' ? 1 : -1);

      this.fallbackModelLanguage = fallbacks[0];
    }

    this.activeModelLanguage = this.editing ?
      this.activeModelLanguage :
      this.fallbackModelLanguage;
  }

  ngOnDestroy() {
    this.parent.deregisterView(this);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this.authorizationManagerService.canEditModel(
        changes.model.currentValue);
    }
  }

  hidePreview() {
  }

  getEditable(): Model | null {
    return this.model;
  }

  setEditable(model: Model | null) {
    this.model = model;
  }

  select(model: Model | null) {
    this.setEditable(model);
    this.modelInEdit = model ? model.clone() : null;

    if (model && model.unsaved) {
      this.edit();
    } else {
      this.cancelEditing();
    }
  }

  edit() {
    this.editorMode = 'editor';
    this.editing = true;
    this.activeModelLanguage = this.modelLanguage;
    this.setEnableContentClickOption();
  }

  cancel() {
    const editable = this.getEditable();
    this.select(!editable ? null : editable.unsaved ? null : editable);

    this.editorMode = 'preview';
    this.editing = false;
    this.activeModelLanguage = this.fallbackModelLanguage;
    this.setEnableContentClickOption();
  }

  async save() {
    this.editorMode = 'preview';

    if (!this.modelInEdit) {
      throw new Error('modelInEdit not set!');
    }

    const editable = this.getEditable();

    if (!editable) {
      throw new Error('editable model not set!');
    }

    const modelInEdit = this.modelInEdit;

    this.persisting = true;
    try {
      await this.modelService.updateModel(modelInEdit);
    } catch (error) {
      this.persisting = false;
      this.errorModalService.openSubmitError(error);
      throw new Error(error);
    }

    this.select(this.modelInEdit);
    this.updated.emit(modelInEdit);
    this.updateModelLanguage();
    this.activeModelLanguage = this.fallbackModelLanguage;
    this.persisting = false;
    this.editing = false;
    this.setEnableContentClickOption();
  }

  isEditing(): boolean {
    return this.editing;
  }

  cancelEditing(): void {
    if (!this.isEditing()) {
      return;
    }

    this.editorMode = 'preview';
    this.editing = false;
    const editable = this.getEditable();
    this.select(!editable ? null : editable.unsaved ? null : editable);
    this.setEnableContentClickOption();
  }

  setEnableContentClickOption(): void {
    // During editing clicking links is disabled, 
    // because by accidental click all changes in the editor are lost
    if (this.editing) {
      this.options.enablePreviewContentClick = false;
    } else {
      this.options.enablePreviewContentClick = true;
    }
    this.options = Object.assign({}, this.options);
  }
}
