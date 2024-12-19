import { Base } from "../types/base";
import { Event } from "../types/event";
import { Model } from "../types/model";

export class EventEmitter<E extends Base.List = Base.List> {
    constructor(
        readonly target: Model,
        readonly key: string,
        readonly alias: Readonly<Base.List<EventEmitter<E>>> = []
    ) {}
}

export class EventHandler<E extends Base.List = Base.List> {
    constructor(
        readonly target: Model,
        readonly handler: Event<E>
    ) {}    
}
