import { DecoyAgent } from "./agent/decoy"
import { Chunk } from "./types/chunk"
import { BaseEvent, EventEmitters, EventProducers } from "./types/event"
import { Props, StrictProps } from "./types/props"
import { Value } from "./types"
import { ProductContext } from "@/context/product"
import { DebugContext } from "@/context/debug"
import { EventAgent } from "@/agent/event"
import { StateAgent } from "@/agent/state"
import { ChildAgent } from "@/agent/child"
import { AgentGroup } from "@/agent"
import { ReferAgent } from "@/agent/refer"
import { DecorProducers } from "./types/decor"

type BaseModel = Model<{}, {}, {}, BaseModel | undefined, {}, BaseModel, {}, {}>

export namespace Model {
    export type Props<M extends Model = Model> = M['props']
    export type Chunk<M extends Model = Model> = M['chunk']
    export type Decoy<M extends Model = Model> = M['agent']['decoy']
    export type State<M extends Model = Model> = M['state']
    export type Child<M extends Model = Model> = M['child']
    export type Refer<M extends Model = Model> = M['refer']
}

export type ProxyGroup<
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    C1 extends Record<string, Model> = {},
    C2 extends Model = Model,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model[]> = {},
> = {
    event: EventEmitters<E>;
    child: C1 & C2[];
    state: S1 & S2;
    refer: R1 & R2;
}

export abstract class Model<
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    P extends Model | undefined = BaseModel | undefined,
    C1 extends Record<string, Model> = {},
    C2 extends Model = BaseModel,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model[]> = {}
> {
    public agent: Readonly<AgentGroup<E, S1, S2, C1, C2, R1, R2, this>>;
    
    protected proxy: Readonly<ProxyGroup<E, S1, S2, C1, C2, R1, R2>>;

    public decoy: DecoyAgent<E, S1, C1, C2, this>;

    public get state(): Readonly<S1 & S2> { 
        return { ...this.agent.state.current } 
    }
    
    public get child(): Readonly<C1 & C2[]>  { 
        return this.agent.child.copy() 
    }

    public get refer(): Readonly<R1 & R2> {
        return this.agent.refer.copy();
    }

    public readonly uuid: string;

    public readonly target: this;

    public get path() {
        return this.agent.child.path;
    }

    public get parent() {
        return this.agent.child.parent
    }

    protected setStateBatch
    
    constructor(props: StrictProps<S1, S2, C1, C2, R1, R2>) {

        this.target = this;
        this.agent = {
            event: new EventAgent(this),
            child: new ChildAgent(this, props.child),
            state: new StateAgent(this, props.state),
            refer: new ReferAgent(this, props.refer),
            decoy: new DecoyAgent(this)
        }
        const agent = this.agent;
        this.proxy = {
            event: agent.event.emitters,
            child: agent.child.proxy,
            state: agent.state.proxy,
            refer: agent.refer.proxy
        }
        this.decoy = this.agent.decoy;

        this.uuid = props.uuid;
        this.setStateBatch = agent.state.setBatch;
    }
    

    private static root: Model | undefined;
    @DebugContext.log()
    static boot<M extends Model>(props: Model.Chunk<M>): M | undefined {
        // if (Model.root) return Model.root as M;
        // if (!props) return;
        // const type = ProductContext.getType(props.code);
        // if (!type) return;
        // props = { ...props, path: 'root', uuid }
        // const model: M = new type(props)
        // Model.root = model;
        // model.agent.child.load()
        // return model;
        return undefined as any;
    }

    public get props(): Readonly<Props<S1, S2, C1, C2, R1, R2>> {
        const result: StrictProps<S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            state: { ...this.proxy.state },
            child: { ...this.proxy.child },
            refer: { ...this.proxy.refer },
        }
        return result;
    }

    public get chunk(): Chunk<S1, S2, C1, C2, R1, R2> | undefined {
        const code = ProductContext.getCode(this.constructor);
        if (!code) return undefined;
        return {
            code,
            uuid: this.uuid,
            state: { ...this.proxy.state },
            child: { ...this.agent.child.chunk },
            refer: { ...this.agent.refer.chunk },
        }
    }
    
    @DebugContext.log()
    public debug() {
        console.log(this.child);
    }

    

}

