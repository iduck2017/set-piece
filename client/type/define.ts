import { Version } from "@/model/app";
import { Model } from "../model";
import { Base, KeyOf, Strict, ValidOf } from "./base";

export type Def = {
    type: string,
    childList: Record<string, Model[]>,
    childDict: Record<string, Model>,
    memoState: Base.Data,
    tempState: Record<string, Base.Value | Readonly<Base.Value[]> | Model | Readonly<Model[]>>,
    event: Record<string, any>,
    parent: Model,
}

type PureDef = {
    type: string,
    childList: {},
    childDict: {},
    memoState: {},
    tempState: {},
    event: {},
}

export namespace Def {
    export type Type<T extends Partial<Def>> = (T & PureDef)['type'];
    export type ChildList<T extends Partial<Def>> = (T & PureDef)['childList'];
    export type ChildDict<T extends Partial<Def>> =  (T & PureDef)['childDict'];
    export type MemoState<T extends Partial<Def>> =  (T & PureDef)['memoState'];
    export type TempState<T extends Partial<Def>> =  (T & PureDef)['tempState'];
    export type Event<T extends Partial<Def>> =  (T & PureDef)['event'];
    export type Parent<T extends Partial<Def>> =  
        T['parent'] extends undefined ? undefined :
            T['parent'] extends Model ? T['parent'] : Model;
}

export type Seq<T extends Partial<Def>> = Readonly<{
    id?: string,
    type: Def.Type<T>,
    rule?: Version,
    childDict?: Readonly<Strict<Partial<{
        [K in KeyOf<ValidOf<Def.ChildDict<T>>>]?: 
            Model.Seq<Required<Def.ChildDict<T>>[K]>
    }>>>,
    childList?: Readonly<Strict<Partial<{
        [K in KeyOf<ValidOf<Def.ChildList<T>>>]?: 
            Model.Seq<Required<Def.ChildList<T>>[K][number]>[]
    }>>>,
    memoState?: Readonly<Partial<ValidOf<Def.MemoState<T>>>>
}>

