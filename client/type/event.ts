import { Base, Dict } from "./base";
import { Model } from "./model";

export type Event<D extends Base.List> = (...args: D) => void; 

export namespace Event {
    export type Dict<T extends Base.Dict<Base.List>> = {
        [K in Dict.Key<T>]: Event<Required<T>[K]>;
    }

    export class Emitter<E extends Base.List = Base.List> {
        constructor(
            readonly target: Model,
            readonly key: string,
            readonly alias: Readonly<Base.List<Emitter<E>>> = []
        ) {}
    }
    export class Handler<E extends Base.List = Base.List> {
        constructor(
            readonly target: Model,
            readonly handler: Event<E>
        ) {}    
    }
    
    export type EmitterDict<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: Emitter<Required<T>[K]>; 
    }
    export type EmitterRect<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: Base.List<Emitter<Required<T>[K]>> 
    }
    export type HandlerDict<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: Handler<Required<T>[K]>; 
    }

}

