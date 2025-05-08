import { EventEmitters } from "./types/event"
import { Props, StrictProps } from "./types/props"
import { Value } from "./types"
import { DebugService } from "@/service/debug"
import { EventAgent } from "@/agent/event"
import { StateAgent } from "@/agent/state"
import { ChildAgent } from "@/agent/child"
import { Agents } from "@/agent/index"
import { ReferAgent } from "@/agent/refer"
import { ModelProxy } from "./utils/proxy"
import { ModelCycle } from "./utils/cycle"

type BaseModel = Model<{}, {}, {}, BaseModel, {}, BaseModel, {}, {}>

export abstract class Model<
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    P extends Model = BaseModel,
    C1 extends Record<string, Model> = {},
    C2 extends Model = BaseModel,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model[]> = {}
> {
    public readonly proxy: ModelProxy<E, S1, C1, C2, this>;

    public readonly agent: Readonly<Agents<E, S1, S2, C1, C2, R1, R2, this>>;

    public readonly cycle: ModelCycle;

    protected readonly draft: Readonly<{
        child: C1 & C2[];
        state: S1 & S2;
        refer: Partial<R1> & R2;
    }>;

    protected readonly event: Readonly<EventEmitters<E>>;


    public get state(): Readonly<S1 & S2> { 
        return this.agent.state.current;
    }
    
    public get child(): Readonly<C1 & C2[]>  { 
        return this.agent.child.current 
    }

    public get refer(): Readonly<Partial<R1> & R2> {
        return this.agent.refer.current
    }

    public readonly target: this;

    public readonly uuid: string;


    public get parent() {
        return this.cycle.parent;
    }

    public get status() {
        return this.cycle.status;
    }
    
    public get path() {
        return this.cycle.path;
    }

    constructor(props: StrictProps<S1, S2, C1, C2, R1, R2>) {
        this.target = this;
        this.uuid = props.uuid ?? crypto.randomUUID()

        this.cycle = new ModelCycle(this);
        this.proxy = new ModelProxy(this)
        this.agent = {
            event: new EventAgent(this),
            child: new ChildAgent(this, props.child),
            state: new StateAgent(this, props.state),
            refer: new ReferAgent(this, props.refer),
        }


        this.draft = {
            child: this.agent.child.draft,
            state: this.agent.state.draft,
            refer: this.agent.refer.draft
        }
        this.event = this.agent.event.emitters;
    }

    public get props(): Readonly<Props<S1, S2, C1, C2, R1, R2>> {
        const result: StrictProps<S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this.draft.refer },
        }
        return result;
    }

    public get copy(): this {
        const type: any = this.constructor;
        const props = this.props;
        return new type({ ...props, uuid: undefined });
    }
    
    @DebugService.log()
    public debug() {
        console.log(this.child);
    }
}


export namespace Model {
    export type Props<M extends Model = Model> = M['props']
    export type Proxy<M extends Model = Model> = M['proxy']
    export type State<M extends Model = Model> = M['state']
    export type Child<M extends Model = Model> = M['child']
    export type Refer<M extends Model = Model> = M['refer']
}