import { Model } from "../model";
import { IType } from ".";

export type Emitter<E extends Event = Event> = (event: E) => void
export type Handler<E extends Event = Event, M extends Model = Model> = (that: M, event: E) => void

export class Consumer {
    public readonly model: Model;
    public readonly handler: Handler;
    constructor(
        model: Model,
        handler: Handler
    ) {
        this.model = model;
        this.handler = handler;
    }
}

export class Producer<E extends Event = Event, M extends Model = Model> {
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

export class Event<T extends Record<string, any> = {}> {
    private _isAbort: boolean = false;
    public get isAbort() { return this._isAbort; }

    protected _detail: T;
    public get detail(): T { return { ...this._detail } }
    constructor(detail: T) {
        this._detail = detail;
    }

    public abort() { this._isAbort = true; }
}
