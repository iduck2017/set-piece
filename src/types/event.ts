import { Model } from "../model"

export type EventHandler<E = any, M extends Model = Model> = (target: M, event: E) => void

export type EventEmitter<E = Record<string, any>> = { [K in keyof E]: (event: E[K]) => void }

export type EventConsumer = { target: Model, handler: EventHandler }


export type OnStateChange<M extends Model> = { prev: Model.State<M>, next: Model.State<M> }

export type OnChildChange<M extends Model> = { prev: Model.Child<M>, next: Model.Child<M> }

export type OnReferChange<M extends Model> = { prev: Model.Refer<M>, next: Model.Refer<M> }

export type onParentChange = { prev?: Model, next?: Model }

export type ModelEvent<M extends Model> = {
    onStateChange: OnStateChange<M>
    onChildChange: OnChildChange<M>
    onReferChange: OnReferChange<M>
    onRouteChange: onParentChange
} & Record<string, any>

