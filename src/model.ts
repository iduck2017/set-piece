import { EventAgent  } from "./agent/event";
import { StateAgent } from "./agent/state";
import { RouteAgent } from "./agent/route";
import { ChildAgent } from "./agent/child";
import { Proxy } from "./proxy";
import { DeepReadonly, Mutable } from "utility-types";
import { ReferAgent } from "./agent/refer";
import { v4 as uuidv4 } from 'uuid';

export namespace Define {
    export type P = Model
    export type E = Record<string, any>
    export type S = Record<string, any>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
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
    P extends Define.P = Define.P,
    E extends Define.E = {},
    S extends Define.S = {},
    C extends Define.C = {},
    R extends Define.R = {},
> = Readonly<{
    event: EventAgent<M, E>
    route: RouteAgent<M, P>
    state: StateAgent<M, S>
    child: ChildAgent<M, C>
    refer: ReferAgent<M, R>
}>


export type Props<
    S extends Define.S = {},
    C extends Define.C = {},
    R extends Define.R = {},
> = {
    uuid?: string
    state: S
    child: C
    refer?: Partial<R>
}

export class Model<
    P extends Define.P = Define.P,
    E extends Define.E = {},
    S extends Define.S = {},
    C extends Define.C = {},
    R extends Define.R = {},
> {
    public get state(): DeepReadonly<S> {
        return this.agent.state.current as any;
    } 
    
    public get refer(): Readonly<{ [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] }> { 
        return this.agent.refer.current; 
    }

    public get child(): Readonly<{ [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }> { 
        return this.agent.child.current; 
    }

    public get parent(): P | undefined {
        return this.agent.route.parent;
    }

    protected readonly event: Readonly<{ [K in keyof E]: (event: E[K]) => void }>;

    protected readonly draft: Readonly<{
        state: S; 
        child: C;
        refer: R;
    }>

    public readonly target: this

    public readonly agent: Agent<this, P, E, S, C, R>

    public readonly proxy: Proxy<this, E, S, C>

    public readonly uuid: string

    public get props(): {
        uuid?: string
        state?: Partial<S>,
        child?: Partial<C>,
        refer?: Partial<R>,
    } {
        return {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this.draft.refer },
        }
    }

    constructor(props: Props<S, C, R>) {
        this.target = this;
        this.uuid = props.uuid ?? uuidv4();
        this.proxy = new Proxy(this);

        this.agent = {
            event: new EventAgent<this, E>(this),
            route: new RouteAgent<this, P>(this),
            state: new StateAgent<this, S>(this, props.state),
            child: new ChildAgent<this, C>(this, props.child),
            refer: new ReferAgent<this, R>(this, props.refer),
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


