import { EventAgent } from "@/agent/event";
import { Model } from "@/model";
import { ChildAgent } from "./child";
import { StateAgent } from "./state";
import { ReferAgent } from "./refer";
import { Value } from "@/types";
import { RouteAgent } from "./route";

export type Agents<
    P extends Model = Model,
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    C1 extends Record<string, Model> = {},
    C2 extends Record<string, Model> = {},
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model> = {},
    M extends Model = Model
> = {
    event: EventAgent<E, M>;
    child: ChildAgent<C1, C2, M>;
    state: StateAgent<S1, S2, M>;
    refer: ReferAgent<R1, R2, M>;
    route: RouteAgent<P, M>;
}

export class Agent<M extends Model = Model> {
    
    public readonly target: M;

    public get agent(): Agents {
        return this.target._agent;
    }

    constructor(target: M) {
        this.target = target;
    }
}