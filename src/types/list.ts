import { Model } from "../models/base";
import { ChildrenOF, UnionOF } from "./reflex";
import { 
    IModelConfig, 
    ModelConfig, 
    ModelDefinition, 
    ModelChunk, 
    ModelTemplate
} from "./model";

type ListDefinition = ModelDefinition & {
    children: Model[]
}

type ListTemplate = ModelTemplate & {
    children: never[]
}

type ListConfig<T extends ListDefinition> = 
    ModelConfig<T> & {
        children: ChildrenOF<T>,
    }

type IListConfig<T extends ListDefinition> = 
    IModelConfig<T> & {
        children?: Partial<ChildrenOF<T>> 
    }

type ListChunk<T extends ListDefinition> = 
    ModelChunk<T> & {
        children: ChildrenOF<T>
    }

type IListDefinition<T extends Partial<ListDefinition>> = 
    UnionOF<T, ListDefinition>

type IListTemplate<T extends Partial<ListDefinition>> = 
    UnionOF<T, ListTemplate>


export {
    ListChunk,
    ListTemplate,
    ListDefinition,
    ListConfig,
    IListConfig,
    IListTemplate,
    IListDefinition
};