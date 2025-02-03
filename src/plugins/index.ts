import { Value } from "@/types";
import { EventEmitters, EventPlugin, EventProducers, ModelEvent } from "./event";
import { StatePlugin } from "./state";
import { ReferPlugin, DictChildPlugin, ListChildPlugin } from "./refer";
import { DecorPlugin } from "./decor";

export type BaseModel = Model<
    Record<string, Value>,
    Record<string, BaseModel> | BaseModel[],
    Record<string, any>,
    BaseModel | undefined
>

export abstract class Model<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>,
    P extends BaseModel | undefined
> {
    /** @internal */
    readonly event!: EventPlugin<S, C, E>

    /** @internal */
    readonly state!: StatePlugin<S>

    /** @internal */
    readonly refer!: ReferPlugin<C, P>

    /** @internal */
    readonly decor!: DecorPlugin<S>


    
    copy(uuid?: string): typeof this {
        return new this.constructor(this.props)
    }

    get props() {
        return {
            uuid: this._uuid,
            child: this.refer.child,
            state: this.state.current
        }
    }

    constructor(props: {
        uuid: string,
        child: Readonly<C>,
        state: Readonly<S>
    }) {

    }
}
