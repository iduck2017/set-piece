import { Model } from "../model";
import { IType } from ".";

export type EventEmitter<E extends Event = Event> = (event: E) => E
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

export class Event<
    T extends Record<string, any> = {}
> {
    private _isCancel: boolean;
    public get isCancel() { return this._isCancel; }
    public cancel() { this._isCancel = true; }

    protected _detail: T;
    public get detail(): Readonly<T> { return { ...this._detail } }
    constructor(detail: T) { 
        this._detail = detail;
        this._isCancel = false;
    }
}
