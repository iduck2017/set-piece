import { Value } from "./types"
import { Model } from "./model"
import { FactoryService } from "./services/factory";

export class Event<E = any> {
    public readonly lane: number;
    public readonly uuid: string;
    public readonly target: Model

    constructor(
        target: Model,
        lane?: number,
        uuid?: string,
    ) {
        this.target = target;
        this.lane = lane ?? 0;
        this.uuid = uuid ?? FactoryService.uuid;
    }
}

export type childUpdateEvent<
    S extends Record<string, Value>,
    C extends Record<string, Model> | Model[]
> = Event<{ 
    target: Model<S, {}, C>
    childPrev: Readonly<C>
    childNext: Readonly<C>
}>

export type StateUpdateEvent<
    S extends Record<string, Value>,
> = Event<{ 
    target: Model<S>, 
    statePrev: Readonly<S>,
    stateNext: Readonly<S>
}>
