import { Def } from "./define"
import { BaseModel, Model } from "./model"

export type EventHandler<E = any, M extends BaseModel = BaseModel> = (target: M, event: E) => void
export type EventEmitter<E> = (event: E) => void

export type EventProducer<E = any, M extends BaseModel = BaseModel> = { 
    target: M, 
    key: string, 
    path?: string[] 
}

export type EventProducers<T extends Def, M extends BaseModel> = { 
    [K in keyof Def.Event<T>]: EventProducer<Def.Event<T>[K], M> 
}
export type EventEmitters<T extends Def> = { 
    [K in keyof Def.Event<T>]: EventEmitter<Def.Event<T>[K]> 
}

type OnStateChange<M extends BaseModel> = { 
    statePrev: Model.State<M>, 
    stateNext: Model.State<M> 
}

type OnChildChange<M extends BaseModel> = { 
    childPrev: Model.Child<M>, 
    childNext: Model.Child<M>,
    childGroupPrev: Model.ChildGroup<M>,
    childGroupNext: Model.ChildGroup<M>
}

type OnReferChange<M extends BaseModel> = { 
    referPrev: Model.Refer<M>, 
    referNext: Model.Refer<M>,
    referGroupPrev: Model.ReferGroup<M>,
    referGroupNext: Model.ReferGroup<M>
}

type BaseEvent<M extends BaseModel> = { 
    onStateChange: OnStateChange<M>, 
    onChildChange: OnChildChange<M>, 
    onReferChange: OnReferChange<M> 
}
