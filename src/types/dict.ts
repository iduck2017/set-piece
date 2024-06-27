import type { Model } from "../models/base";
import { VoidRecord } from "./base";
import { ChildrenOF, UnionOF } from "./reflex";
import { 
    IModelConfig, 
    ModelConfig, 
    ModelDefinition, 
    ModelChunk, 
    ModelTemplate 
} from "./model";

type DictDefinition = ModelDefinition & {
    children: Record<string, Model>
}

type DictTemplate = ModelTemplate & {
    children: VoidRecord
}

type DictChunk<T extends DictDefinition> = 
    ModelChunk<T> & {
        children: ChildrenOF<T>
    }

type DictConfig<T extends DictDefinition> = 
    ModelConfig<T> & {
        children: ChildrenOF<T>,
    }

type IDictConfig<T extends DictDefinition> =
    IModelConfig<T> & {
        children?: Partial<ChildrenOF<T>> 
    }

type IDictDefinition<T extends Partial<DictDefinition>> = 
    UnionOF<T, DictDefinition>

type IDictTemplate<T extends Partial<DictDefinition>> = 
    UnionOF<T, DictTemplate>

export {
    DictChunk,
    DictTemplate,
    DictDefinition,
    DictConfig,
    IDictConfig,
    IDictTemplate,
    IDictDefinition
};