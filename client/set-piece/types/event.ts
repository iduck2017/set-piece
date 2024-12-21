import { EventEmitter, EventHandler } from "../utils/event";
import { Base, Dict } from "./base";

export type Event<D extends Base.List> = (...args: D) => void; 

export namespace Event {
    export type Dict<T extends Base.Dict<Base.List>> = {
        [K in Dict.Key<T>]: Event<Required<T>[K]>;
    }
    export type EmitterInfo<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: Base.List<EventEmitter<Required<T>[K]> | undefined> 
    }

    export type EmitterDict<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: EventEmitter<Required<T>[K]>; 
    }
    export type HandlerDict<T extends Base.Dict<Base.List>> = { 
        [K in Dict.Key<T>]: EventHandler<Required<T>[K]>; 
    }
}
