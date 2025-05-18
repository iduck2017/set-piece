import { RawProps, Props } from "./types/props"
import { Value } from "./types"
import { EventAgent } from "@/agent/event"
import { StateAgent } from "@/agent/state"
import { ChildAgent, ChildGroup } from "@/agent/child"
import { Agents } from "@/agent/index"
import { ReferAgent, ReferGroup } from "@/agent/refer"
import { ModelProxy } from "./utils/proxy"
import { ModelCycle } from "./utils/cycle"
import { v4 as uuid } from 'uuid';
import { EventEmitter } from "./types/event"

export namespace Define {
    export type P = Model
    export type E = Record<string, any>
    export type S1 = Record<string, Value>
    export type S2 = Record<string, Value>
    export type C1 = Record<string, Model>
    export type C2 = Record<string, Model>
    export type R1 = Record<string, Model>
    export type R2 = Record<string, Model>
}

export abstract class Model<
    P extends Define.P = Define.P,
    E extends Define.E = {},
    S1 extends Define.S1 = {},
    S2 extends Define.S2 = {},
    C1 extends Define.C1 = {},
    C2 extends Define.C2 = {},
    R1 extends Define.R1 = {},
    R2 extends Define.R2 = {},
> {
    public readonly proxy: ModelProxy<E, S1, C1, C2, this>;
    
    public readonly _cycle: ModelCycle<P, this>;

    public readonly _agent: Readonly<Agents<E, S1, S2, C1, C2, R1, R2, this>>;



    public get name(): string { return this.constructor.name; }

    public get state(): Readonly<S1 & S2> { return this._agent.state.current; }
    
    public get child(): Readonly<ChildGroup<C1, C2>>  { return this._agent.child.current }

    public get refer(): Readonly<ReferGroup<R1, R2>> { return this._agent.refer.current }
    
    public get parent(): P | undefined { return this._cycle.parent }



    public readonly target: this;

    public readonly uuid: string;



    protected readonly draft: Readonly<{
        state: S1 & S2;
        child: ChildGroup<C1, C2>;
        refer: ReferGroup<R1, R2>;
    }>;

    protected readonly event: Readonly<EventEmitter<E>>;

    


    constructor(props: Props<S1, S2, C1, C2, R1, R2>) {

        this.target = this;

        this.uuid = props.uuid ?? uuid();

        this.proxy = new ModelProxy(this);

        this._cycle = new ModelCycle(this);
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
        this.event = this._agent.event.current;
    }

    public get props(): Readonly<RawProps<S1, S2, C1, C2, R1, R2>> {
        return {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this._agent.refer.addrs },
        }
    }

    public get copy(): this {
        const type: any = this.constructor;
        const props = this.props;
        const result =  new type({ ...props, uuid: undefined });
        console.log('copy', result.uuid, this.uuid);
        return result;
    }
    
    
    public debug() { console.log(this) }

    protected reload() { this._cycle.reload() }
    
}


export namespace Model {
    export type Proxy<M extends Model = Model> = M['proxy']
    export type State<M extends Model = Model> = M['state']
    export type Child<M extends Model = Model> = M['child']
    export type Refer<M extends Model = Model> = M['refer']
    export type Props<M extends Model = Model> = M['props']
}

