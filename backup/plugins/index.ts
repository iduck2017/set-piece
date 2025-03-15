import { EventPlugin, ModelEvent } from "./event";
import { Value } from "@/types";

export class Model<D extends Def> {

}

export type BaseModel = Model<Def>;


export interface Def {
    state: Record<string, Value>;
    child: Record<string, BaseModel> | BaseModel[];
    event: Partial<ModelEvent<
        Record<string, Value>,
        Record<string, BaseModel> | BaseModel[]
    >>
    refer: Record<string, BaseModel | BaseModel[]>
    parent: BaseModel | null
}

export interface PluginContext<
    D extends Def,
    M extends BaseModel
>  {
    event: EventPlugin<Def>;
    child: Plugin;
    refer: Plugin;
    state: Plugin;
    decor: Plugin;
}

export type ContextGetter = <
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>,
    P extends BaseModel,
    R extends Record<string, BaseModel | BaseModel[]>
>(model: Model<S, C, E, P, R>) => PluginContext<S, C, E>;

export class Plugin {
    readonly self: BaseModel;
    readonly context: PluginContext;
    protected readonly getContext: ContextGetter;

    constructor(
        self: BaseModel,
        getContext: ContextGetter 
    ) {
        this.self = self;
        this.context = getContext(self);
        this.getContext = getContext;
    }
}

