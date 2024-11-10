import { Model } from "../model";
import { Base, KeyOf, Strict, ValidOf } from "./base";

export type Def = {
    type: string,
    childList: Record<string, Model[]>,
    childDict: Record<string, Model>,
    state: Base.Data,
    tempState: Record<string, any>,
    initState: Base.Data,
    sealState: Record<string, boolean>
    event: Record<string, any>,
    parent: Model,
}

type PureDef = {
    type: string,
    childList: {},
    childDict: {},
    state: {},
    tempState: {},
    initState: {},
    event: {},
}

export namespace Def {
    export type Type<T extends Partial<Def>> = (T & PureDef)['type'];
    export type ChildList<T extends Partial<Def>> = (T & PureDef)['childList'];
    export type ChildDict<T extends Partial<Def>> =  (T & PureDef)['childDict'];
    export type State<T extends Partial<Def>> =  (T & PureDef)['state'];
    export type TempState<T extends Partial<Def>> =  (T & PureDef)['tempState'];
    export type InitState<T extends Partial<Def>> =  (T & PureDef)['initState'];
    export type Event<T extends Partial<Def>> =  (T & PureDef)['event'];
    export type Parent<T extends Partial<Def>> =  
        T['parent'] extends undefined ? undefined :
            T['parent'] extends Model ? T['parent'] : Model;
}


export type Seq<T extends Partial<Def>> = Readonly<{
    id?: string,
    type: Def.Type<T>,
    childDict?: Readonly<Strict<Partial<{
        [K in KeyOf<ValidOf<Def.ChildDict<T>>>]?: Model.Seq<Required<Def.ChildDict<T>>[K]>
    }>>>,
    childList?: Readonly<Strict<Partial<{
        [K in KeyOf<ValidOf<Def.ChildList<T>>>]?: 
            Model.Seq<Required<Def.ChildList<T>>[K][number]>[]
    }>>>,
    memoState: Readonly<Partial<ValidOf<Def.State<T>>>> & Readonly<ValidOf<Def.InitState<T>>>
}>

