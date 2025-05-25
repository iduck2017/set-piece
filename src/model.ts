import { EventAgent, EventEmitter } from "./agent/event";
import { StateAgent } from "./agent/state";
import { RouteAgent } from "./agent/route";
import { ChildAgent } from "./agent/child";
import { Proxy } from "./proxy";
import { DeepReadonly, Mutable } from "utility-types";
import { ReferAgent } from "./agent/refer";
import { v4 as uuidv4 } from 'uuid';

export namespace BaseDefine {
    export type P = Model
    export type E = Record<string, any>
    export type S = Record<string, any>
    export type C = Record<string, Model>
    export type R = Record<string, Model>
}

export namespace Model {
    export type State<M extends Model = Model> = M['state']
    export type Child<M extends Model = Model> = M['child']
    export type Refer<M extends Model = Model> = M['refer']
    export type Proxy<M extends Model = Model> = M['proxy']
    export type Props<M extends Model = Model> = M['props']
    export type Parent<M extends Model = Model> = M['parent']
}


export type Agent<
    M extends Model = Model,
    P extends BaseDefine.P = BaseDefine.P,
    E extends BaseDefine.E = {},
    S1 extends BaseDefine.S = {},
    S2 extends BaseDefine.S = {},
    C1 extends BaseDefine.C = {},
    C2 extends BaseDefine.C = {},
    R1 extends BaseDefine.R = {},
    R2 extends BaseDefine.R = {},
> = Readonly<{
    event: EventAgent<M, E>
    route: RouteAgent<M, P>
    state: StateAgent<M, S1, S2>
    child: ChildAgent<M, C1, C2>
    refer: ReferAgent<M, R1, R2>
}>

type Draft<
    S1 extends Record<string, any> = {},
    S2 extends Record<string, any> = {},
    C1 extends Record<string, any> = {},
    C2 extends Record<string, any> = {},
    R1 extends Record<string, any> = {},
    R2 extends Record<string, any> = {},
> = Readonly<{
    state: Mutable<DeepReadonly<S1 & S2>> 
    child: 
        { [K in keyof C1]: C1[K] } & 
        { [K in keyof C2]: Array<Required<C2>[K]> }
    refer: 
        { [K in keyof R1]?: R1[K] } & 
        { [K in keyof R2]?: Array<Required<R2>[K]> }
}>

export type Props<
    S1 extends BaseDefine.S = {},
    S2 extends BaseDefine.S = {},
    C1 extends BaseDefine.C = {},
    C2 extends BaseDefine.C = {},
    R1 extends BaseDefine.R = {},
    R2 extends BaseDefine.R = {},
> = {
    uuid?: string
    state: Mutable<DeepReadonly<S1 & S2>>
    child: Readonly<
        { [K in keyof C1]: C1[K] } & 
        { [K in keyof C2]: Array<Required<C2>[K]> }
    >
    refer?: Readonly<
        { [K in keyof R1]?: R1[K] } & 
        { [K in keyof R2]?: Array<Required<R2>[K]> }
    >
}

type RawProps<
    S1 extends BaseDefine.S = {},
    S2 extends BaseDefine.S = {},
    C1 extends BaseDefine.C = {},
    C2 extends BaseDefine.C = {},
    R1 extends BaseDefine.R = {},
    R2 extends BaseDefine.R = {},
> = {
    uuid?: string
    state?: Partial<Mutable<DeepReadonly<S1 & S2>>>,
    child?: Partial<Readonly<
        { [K in keyof C1]: C1[K] } & 
        { [K in keyof C2]: Array<Required<C2>[K]> }
    >>,
    refer?: Readonly<
        { [K in keyof R1]?: R1[K] } & 
        { [K in keyof R2]?: Array<Required<R2>[K]> }
    >,
}


export class Model<
    P extends BaseDefine.P = BaseDefine.P,
    E extends BaseDefine.E = {},
    S1 extends BaseDefine.S = {},
    S2 extends BaseDefine.S = {},
    C1 extends BaseDefine.C = {},
    C2 extends BaseDefine.C = {},
    R1 extends BaseDefine.R = {},
    R2 extends BaseDefine.R = {},
> {
    public get state(): Readonly<DeepReadonly<S1 & S2>> {
        return this.agent.state.current;
    } 
    
    public get refer(): Readonly<
        { [K in keyof R1]?: R1[K] } & 
        { [K in keyof R2]?: ReadonlyArray<Required<R2>[K]> }
    > { 
        return this.agent.refer.current; 
    }

    public get child(): Readonly<
        { [K in keyof C1]: C1[K] } & 
        { [K in keyof C2]: ReadonlyArray<Required<C2>[K]> }
    > { 
        return this.agent.child.current; 
    }

    protected readonly event: Readonly<EventEmitter<E>>;

    protected readonly draft: Draft<S1, S2, C1, C2, R1, R2>

    public readonly target: this

    public readonly parent?: P

    public readonly agent: Agent<this, P, E, S1, S2, C1, C2, R1, R2>

    public readonly proxy: Proxy<this, E, S1, C1, C2>

    public readonly uuid: string

    public get props(): RawProps<S1, S2, C1, C2, R1, R2> {
        return {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this.draft.refer },
        }
    }

    constructor(props: Props<S1, S2, C1, C2, R1, R2>) {
        this.target = this;
        this.uuid = props.uuid ?? uuidv4();
        this.proxy = new Proxy(this);

        this.agent = {
            event: new EventAgent<this, E>(this),
            route: new RouteAgent<this, P>(this),
            state: new StateAgent<this, S1, S2>(this, props.state),
            child: new ChildAgent<this, C1, C2>(this, props.child),
            refer: new ReferAgent<this, R1, R2>(this, props.refer),
        }

        this.event = this.agent.event.current;
        this.draft = {
            state: this.agent.state.draft,
            child: this.agent.child.draft,
            refer: this.agent.refer.draft,
        }
    }

    
    public copy(): this {
        const props = this.props;
        const type: any = this.constructor;
        return new type({
            ...props,
            uuid: undefined
        });
    }

    public reload() {
        this.agent.route.reload();
    }

    public static isModel(value: any): value is Model {
        return value instanceof Model;
    }
}


