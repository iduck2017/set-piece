import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseRecord, VoidRecord } from "./base";
import { 
    IDOF, 
    RuleOF,
    StateOF, 
    InfoOF,
    ProvidersOF,
    ReferOF,
    ConsumersOF,
    UnionOF
} from "./reflex";

type ModelEvents = {
    checkBefore: Model[],
    updateDone: Model[],
}

type ModelDefinition = {
    id: number;  
    rule: BaseRecord,
    info: BaseRecord,
    state: BaseRecord,
    extra: BaseRecord,
    parent: Model | App,
    providers: Record<string, Model[]>,
    consumers: Record<string, Model[]>,
}

type ModelTemplate = {
    id: never;  
    rule: VoidRecord,
    info: VoidRecord,
    state: VoidRecord,
    extra: VoidRecord,
    parent: Model,
    providers: VoidRecord,
    consumers: VoidRecord,
}

type ModelChunk<T extends ModelDefinition> = {
    key: string,
    id: IDOF<T>,
    rule: RuleOF<T>,
    state: StateOF<T>,
    providers: ReferOF<ProvidersOF<T>>,
    consumers: ReferOF<ConsumersOF<T>>
}

type ModelConfig<T extends ModelDefinition> = {
    app: App,
    key?: string,
    id: IDOF<T>,
    rule: RuleOF<T>,
    info: InfoOF<T>,
    state: StateOF<T>,
    providers: ReferOF<ProvidersOF<T>>,
    consumers: ReferOF<ConsumersOF<T>>
}

type IModelDefinition<T extends Partial<ModelDefinition>> = 
    UnionOF<T, ModelDefinition>

type IModelTemplate<T extends Partial<ModelDefinition>> = 
    UnionOF<T, ModelTemplate>

type IModelConfig<T extends ModelDefinition> = {
    app: App;
    key?: string;
    rule: RuleOF<T>;
    state?: Partial<StateOF<T>>;
    providers?: ReferOF<ProvidersOF<T>>,
    consumers?: ReferOF<ConsumersOF<T>>
}

export {
    ModelChunk,
    ModelEvents,
    ModelTemplate,
    ModelDefinition,
    ModelConfig,
    IModelConfig,
    IModelTemplate,
    IModelDefinition
};