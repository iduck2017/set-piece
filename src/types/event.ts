import { Model } from "../model";
import { IConstructor } from ".";

export type EventHandler<E = any, M extends Model = Model> = (model: M, event: E) => E | void
export type EventEmitter<E = any> = (event: E) => E
export type EventConsumer = { model: Model, handler: EventHandler }
export type EventProducer<E = any, M extends Model = Model> = {
    type?: IConstructor<Model>;
    path?: string;
    name: string;
    event?: E;
    model: M;
}

export class Event<
    T extends Record<string, any> = {}
> {
    private _isAbort: boolean;
    public get isAbort() { return this._isAbort; }

    protected _detail: T;
    public get detail() { return { ...this._detail } }

    constructor(detail: T) { 
        this._detail = detail;
        this._isAbort = false;
    }

    public abort() { this._isAbort = true; }
}

