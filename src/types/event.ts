import { Model } from "../model";
import { IConstructor } from ".";

export type EventHandler<E = any, M extends Model = Model> = (model: M, event: E) => E | void
export type EventEmitter<E = any> = (event: E) => E

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
    public readonly type?: IConstructor<Model>;
    public readonly path?: string;
    public readonly name: string;
    public readonly model: M;
    private readonly event?: E;
    constructor(
        model: M,
        name: string,
        path?: string,
        type?: IConstructor<Model>
    ) {
        this.model = model;
        this.path = path;
        this.type = type;
        this.name = model.name;
    }
}
export class Event<T extends Record<string, any> = {}> {
    private _isCancel: boolean;
    public get isCancel() { return this._isCancel; }
    
    protected _detail: T;
    public get detail(): Readonly<T> { return { ...this._detail } }
    
    constructor(detail: T) { 
        this._detail = detail;
        this._isCancel = false;
    }
    public cancel() { this._isCancel = true; }
}
