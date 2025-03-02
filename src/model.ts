
import { EventHandler, EventPlugin, ModelEvent } from "./plugins/event";
import { ModelProxy } from "./plugins/proxy";
import { ReferPlugin } from "./plugins/refer";
import { StatePlugin } from "./plugins/state";
import { DebugService } from "./services/debug";
import { StoreService } from "./services/store";
import { Value } from "./types";

export type BaseModel = Model<
    Record<string, Value>,
    Record<string, BaseModel> | BaseModel[],
    Record<string, any>,
    BaseModel | null,
    Record<string, BaseModel | Readonly<BaseModel[]>>
>

export abstract class Model<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>,
    P extends BaseModel | null,
    R extends Record<string, BaseModel | Readonly<BaseModel[]>>
> {
    readonly proxy!: ModelProxy<this>

    readonly self: this = this;
    

    get props() {
        return {
            uuid: this.plugins.state.uuid,
            child: this.plugins.refer.childCurrent,
            refer: this.plugins.refer.referCurrent,
            state: this.plugins.state.stateOrigin,
        }
    }

    constructor(props: {
        uuid?: string,
        child: Readonly<C>,
        state: Readonly<S>
    }) {
        const { uuid, state, child } = props;
        this.plugins = {
            refer: new ReferPlugin(child, this),
            event: new EventPlugin(this),
            state: new StatePlugin(uuid, state, this),
        }
    }

    @DebugService.useStack()
    copy(): typeof this {
        const constructor: any = this.constructor;
        return new constructor(this.props)
    }
    
    debug() {
        console.log(this.constructor.name);
        console.log(this.state);
        console.log(this.child);
    }

}


type ModelPlugins<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>,
    P extends BaseModel | null,
    R extends Record<string, BaseModel | Readonly<BaseModel[]>>
> = {
    readonly state: StatePlugin<S>
    readonly refer: ReferPlugin<C, P, R>
    readonly event: EventPlugin<S, C, E>
}
