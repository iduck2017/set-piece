import { Model } from "../model";
import { IType } from ".";

export type EventEmitter<E extends Event = Event> = (event: E) => void
export type EventHandler<
    E extends Event = Event, 
    M extends Model = Model
> = (that: M, event: E) => void

export class EventConsumer {
    public readonly model: Model;
    public readonly handler: EventHandler;
    constructor(
        model: Model,
        handler: EventHandler
    ) {
        this.model = model;
        this.handler = handler;
    }
}

export class EventProducer<E = any, M extends Model = Model> {
    public readonly type?: IType<Model>;
    public readonly path?: string;
    public readonly name: string;
    public readonly model: M;
    private readonly event?: E;
    constructor(
        model: M,
        name: string,
        path?: string,
        type?: IType<Model>
    ) {
        this.model = model;
        this.path = path;
        this.type = type;
        this.name = name;
    }
}

export class Event {
    private _isCancel: boolean = false;
    public get isCancel() { return this._isCancel; }
    public cancel() { this._isCancel = true; }
}

export class MutateEvent<T> extends Event {
    constructor(
        public readonly prev: Readonly<T>,
        public readonly next: Readonly<T>
    ) { super(); }
}