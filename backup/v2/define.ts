import { BaseValue } from "./common";
import { BaseModel } from "./model";


export type Def = {
    code: string;
    state: Record<string, BaseValue>
    child: Record<string, BaseModel>
    refer: Record<string, BaseModel>
    event: Record<string, any>
    stateInner: Record<string, BaseValue>
    referGroup: Record<string, BaseModel[]>
    childGroup: Record<string, BaseModel[]>
    parent?: BaseModel
}

export namespace Def {
    export type Code<T extends Def> = T['code']
    export type State<T extends Def> = T['state']
    export type Child<T extends Def> = T['child']
    export type Refer<T extends Def> = T['refer']
    export type Event<T extends Def> = T['event']
    export type StateInner<T extends Def> = T['stateInner']
    export type ChildGroup<T extends Def> = T['childGroup']
    export type ReferGroup<T extends Def> = T['referGroup']
    export type Parent<T extends Def> = T['parent']
}

export type SuperDef<T extends Def> = Partial<{
    [K in keyof T]: Partial<T[K]>
} & Def>