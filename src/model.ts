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
import { v4 as uuid } from 'uuid';

type _Model = Model<{}, {}, {}, _Model, {}, _Model, {}, {}>

export namespace Define {
    export type E = Record<string, any>
    export type S1 = Record<string, Value>
    export type S2 = Record<string, Value>
    export type P = Model
    export type C1 = Record<string, Model>
    export type C2 = Model
    export type R1 = Record<string, Model>
    export type R2 = Record<string, Model[]>
}

export abstract class Model<
    E extends Define.E = {},
    S1 extends Define.S1 = {},
    S2 extends Define.S2 = {},
    P extends Define.P = Define.P,
    C1 extends Define.C1 = {},
    C2 extends Define.C2 = Define.C2,
    R1 extends Define.R1 = {},
    R2 extends Define.R2 = {}
> {
    public readonly proxy: ModelProxy<E, S1, C1, C2, this>;

    public readonly _agent: Readonly<Agents<E, S1, S2, C1, C2, R1, R2, this>>;

    public readonly _cycle: ModelCycle;

    protected readonly draft: Readonly<{
        child: C1 & C2[];
        state: S1 & S2;
        refer: Partial<R1> & R2;
    }>;

    protected readonly event: Readonly<EventEmitters<E>>;


    public get state(): Readonly<S1 & S2> { 
        return this._agent.state.current;
    }
    
    public get child(): Readonly<C1 & Readonly<C2[]>>  { 
        return this._agent.child.current 
    }

    public get refer(): Readonly<Partial<R1> & R2> {
        return this._agent.refer.current
    }

    public readonly target: this;

    public readonly uuid: string;


    public get parent(): P | undefined {
        return this._cycle.parent as P | undefined;
    }

    public get status() {
        return this._cycle.status;
    }
    
    public get path() {
        return this._cycle.path;
    }

    constructor(props: StrictProps<S1, S2, C1, C2, R1, R2>) {
        this.target = this;
        this.uuid = props.uuid ?? uuid();

        this._cycle = new ModelCycle(this);
        this.proxy = new ModelProxy(this)
        this._agent = {
            event: new EventAgent<E, this>(this),
            child: new ChildAgent<C1, C2, this>(this, props.child),
            state: new StateAgent<S1, S2, this>(this, props.state),
            refer: new ReferAgent<R1, R2, this>(this, props.refer),
        }


        this.draft = {
            child: this._agent.child.draft,
            state: this._agent.state.draft,
            refer: this._agent.refer.draft
        }
        this.event = this._agent.event.emitters;

        this.bindEvent = this._agent.event.bind;
        this.unbindEvent = this._agent.event.unbind;
        this.bindDecor = this._agent.state.bind;
        this.unbindDecor = this._agent.state.unbind;

        this._cycle.init();
    }

    public bindEvent;

    public unbindEvent;

    public bindDecor;

    public unbindDecor;

    public get props(): Readonly<Props<S1, S2, C1, C2, R1, R2>> {
        const result: StrictProps<S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this._agent.refer.addrs },
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
    export type Proxy<M extends Model = Model> = M['proxy']
    export type State<M extends Model = Model> = M['state']
    export type Child<M extends Model = Model> = M['child']
    export type Refer<M extends Model = Model> = M['refer']
    export type Props<M extends Model = Model> = M['props']
}

