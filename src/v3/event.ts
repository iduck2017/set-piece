import { BaseModel, Model } from "./model"

export type EventHandler<E = any, M extends BaseModel = BaseModel> = (target: M, event: E) => void
export type EventEmitter<E> = (event: E) => void

export type EventProducer<E = any, M extends BaseModel = BaseModel> = { 
    target: M, 
    key: string, 
    path?: string[] 
}

export type EventProducers<
    E extends Record<string, any>,
    M extends BaseModel
> = { 
    [K in keyof E]: EventProducer<Required<E>[K], M> 
}

export type EventEmitters<E extends Record<string, any>> = { 
    [K in keyof E]: EventEmitter<Required<E>[K]> 
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
