import type { Model } from "../models/base";
import type { BaseRecord } from "./base";
import type { DictDefinition } from "./dict";
import type { ListDefinition } from "./list";
import type { ModelEvents, ModelDefinition } from "./model";

type ChunkOF<T extends Model | undefined> = 
    T extends Model ? 
    ReturnType<T['serialize']> : 
    undefined;

type IDOF<T extends ModelDefinition> = T['id'];
type RuleOF<T extends ModelDefinition> = T['rule'];
type InfoOF<T extends ModelDefinition> = T['info'];
type StateOF<T extends ModelDefinition> = T['state'];

type ParentOF<T extends ModelDefinition> = T['parent'];
type ProvidersOF<T extends ModelDefinition> = T['providers'] & ModelEvents
type ConsumersOF<T extends ModelDefinition> = T['consumers'] & ModelEvents
type ChildrenOF<T extends DictDefinition | ListDefinition> = T['children'];

type CacheOF<T extends ModelDefinition> = T['rule'] & T['info'] & T['state']
type DataOF<T extends ModelDefinition> = CacheOF<T> & T['extra']
type ReferOF<T extends Record<string, Model[]>> = Record<keyof T, string[]>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementOF<T extends any[]> = T[number];
type ValueOF<T extends BaseRecord> = T[keyof T]; 

type UnionOF<
    C extends BaseRecord,
    D extends BaseRecord,
> = Omit<D, keyof C> & C


export {
    ChunkOF,
    IDOF,
    RuleOF,
    InfoOF,
    StateOF,
    ParentOF,
    ChildrenOF,
    CacheOF,
    DataOF,
    ProvidersOF,
    ConsumersOF,
    ReferOF,
    ElementOF,
    ValueOF,
    UnionOF
};