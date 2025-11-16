import { IClass } from ".";
import { Model } from "../model";

export type Emitter<E = any> = (event: E) => any
export type Handler<E = any, M extends Model = any> = (that: M, event: E) => any

export type Consumer = Readonly<{ model: Model, handler: Handler }>
export type Producer<E = any, M extends Model = Model> = Readonly<{
    model: M;
    name: string;
    keys: Array<string | IClass>;
    _never?: E;
}>

export class Event<E extends Record<string, any> = {}> {

    protected origin: E;

    public get detail(): Readonly<E> { 
        return { ...this.origin };
    }

    constructor(event: E) {
        this.origin = event;
    }
}
