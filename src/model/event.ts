import { Model } from "./model"

export type EventHandler<E = any, M extends Model = Model> = (target: M, event: E) => void

export type EventEmitter<E> = (event: E) => void
export type EventConsumer = { target: Model, handler: EventHandler }
export type EventEmitters<E extends Record<string, any>> = { [K in keyof E]: EventEmitter<Required<E>[K]> }

export type EventProducers<E extends Record<string, any>, M extends Model> = { [K in keyof E]: EventProducer<Required<E>[K], M> }

export type OnStateChange<M extends Model> = { prev: Model.State<M>, next: Model.State<M> }
export type OnChildChange<M extends Model> = { prev: Model.Child<M>, next: Model.Child<M>, prevGroup: Model.ChildGroup<M>, nextGroup: Model.ChildGroup<M> }
export type OnReferChange<M extends Model> = { prev: Model.Refer<M>, next: Model.Refer<M>, prevGroup: Model.ReferGroup<M>, nextGroup: Model.ReferGroup<M> }
export type BaseEvent<M extends Model> = {
    onStateChange: OnStateChange<M>
    onChildChange: OnChildChange<M>
    onReferChange: OnReferChange<M>
} & Record<string, any>



export class EventProducer<E = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string;

    constructor(target: M, path: string) {
        this.target = target;
        this.path = path;
    }
}

export class EventPlugin<E > {

}
