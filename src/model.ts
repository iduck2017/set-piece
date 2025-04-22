import { DecoyAgent } from "./agent/decoy"
import { ReferAddrs, ReferGroup } from "./types/refer"
import { Chunk, StrictChunk, ChildChunk } from "./types/chunk"
import { BaseEvent, EventEmitters, EventProducers } from "./types/event"
import { Props, StrictProps } from "./types/props"
import { Value } from "./types"
import { ProductContext } from "@/context/product"
import { DebugContext } from "@/context/debug"
import { TrxContext } from "@/context/trx"
import { EventAgent } from "@/agent/event"
import { StateAgent } from "@/agent/state"
import { ChildAgent } from "@/agent/child"
import { AgentGroup } from "@/agent"
import { ReferAgent } from "@/agent/refer"
import { DecorProducer, DecorProducers } from "./types/decor"

type BaseModel = Model<string, {}, {}, {}, BaseModel | undefined, {}, BaseModel, {}, {}>

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
    R2 extends Record<string, Model> = {},
> = {
    event: EventEmitters<E>;
    child: ChildChunk<C1, C2>;
    state: S1 & S2;
    refer: ReferAddrs<R1, R2>;
}


export abstract class Model<
    I extends string = string,
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    P extends Model | undefined = BaseModel | undefined,
    C1 extends Record<string, Model> = {},
    C2 extends Model = BaseModel,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model> = {}
> {
    /** @internal */
    public agent: Readonly<AgentGroup<E, S1, S2, C1, C2, R1, R2, this>>;
    
    protected proxy: Readonly<ProxyGroup<E, S1, S2, C1, C2, R1, R2>>;

    public get state(): Readonly<S1 & S2> { 
        return { ...this.agent.state.current } 
    }
    
    public get child(): Readonly<C1 & C2[]>  { 
        return this.agent.child.copy() 
    }

    public get refer(): Readonly<ReferGroup<R1, R2>> {
        const current = this.agent.refer.current;
        const result = { ...current }
        for (const key of Object.keys(current)) {
            const value = current[key];
            if (value instanceof Array) {
                Reflect.set(result, key, [ ...value ])
            }
        }
        return result;
    }

    public readonly decor: Readonly<DecorProducers<S1, this>>

    public readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;

    public readonly path: string;

    public readonly uuid: string;

    public readonly code: I;

    public readonly root: Model;

    public readonly parent: P;
    
    public readonly target: this;

    protected setStateBatch
    
    constructor(props: StrictProps<I, S1, S2, P, C1, C2, R1, R2>) {
        console.log('Constructor', props.code)

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

        this.parent = props.parent;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.code = props.code;
        this.path = props.path;
        this.event = agent.event.producers;
        this.decor = agent.state.producers;
        this.setStateBatch = agent.state.setBatch;
    }
    

    private static root: Model | undefined;
    @DebugContext.log()
    static boot<M extends Model>(props: Model.Chunk<M>): M | undefined {
        if (Model.root) return Model.root as M;
        const type = ProductContext.query(props.code);
        const uuid = ReferAgent.check()
        if (!type) return undefined;
        props = { ...props, path: 'root', uuid }
        const model: M = new type(props)
        Model.root = model;
        model.agent.child.load()
        return model;
    }

    public get props(): Readonly<Props<I, S1, S2, P, C1, C2, R1, R2>> {
        const result: StrictProps<I, S1, S2, P, C1, C2, R1, R2> = {
            code: this.code,
            uuid: this.uuid,
            path: this.path,
            state: { ...this.proxy.state },
            child: { ...this.proxy.child },
            refer: { ...this.proxy.refer },
            parent: this.parent,
        }
        return result;
    }

    public get chunk(): Chunk<I, S1, S2, C1, C2, R1, R2> {
        const result: StrictChunk<I, S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            code: this.code,
            state: { ...this.proxy.state },
            child: { ...this.proxy.child },
            refer: { ...this.proxy.refer },
        }
        return result;
    }
    
    @DebugContext.log()
    public debug() {
        console.log(this.child);
    }

}

