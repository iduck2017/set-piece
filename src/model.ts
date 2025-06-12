import { EventAgent  } from "./agent/event";
import { State, StateAgent } from "./agent/state";
import { RouteAgent } from "./agent/route";
import { Child, ChildAgent } from "./agent/child";
import { Proxy } from "./proxy";
import { DeepReadonly, Primitive } from "utility-types";
import { Refer, ReferAgent } from "./agent/refer";
import { v4 as uuidv4 } from 'uuid';
import { TranxService } from "./service/tranx";

export type Agent<
    M extends Model = Model,
    P extends Model.P = Model.P,
    E extends Model.E = Model.E,
    S extends Model.S = Model.S,
    C extends Model.C = Model.C,
    R extends Model.R = Model.R,
> = Readonly<{
    event: EventAgent<M, E>
    route: RouteAgent<M, P>
    state: StateAgent<M, S>
    child: ChildAgent<M, C>
    refer: ReferAgent<M, R>
}>


export type Props<
    S extends Model.S = Record<string, never>,
    C extends Model.C = {},
    R extends Model.R = {},
> = {
    uuid?: string
    state?: Partial<S>,
    child?: Partial<C>,
    refer?: Partial<R>,
}


export namespace Model {
    export type P = Model
    export type E = Record<string, any>
    export type S = Record<string, any>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
}



@TranxService.use(true)
export class Model<
    P extends Model.P = Model.P,
    E extends Model.E = {},
    S extends Model.S = {},
    C extends Model.C = {},
    R extends Model.R = {},
> {
    public get name() {
        return this.constructor.name;
    }

    public get state(): DeepReadonly<S> {
        return this.agent.state.current as any;
    } 
    
    public get refer(): Readonly<Refer<R>> { 
        return this.agent.refer.current; 
    }

    public get child(): Readonly<Child<C>> { 
        return this.agent.child.current; 
    }

    public get route(): { 
        parent?: P, 
        root?: Model 
    } {
        return {
            parent: this.agent.route.parent,
            root: this.agent.route.root,
        };
    }

    protected readonly event: Readonly<{ [K in keyof E]: (event: E[K]) => void }>;

    protected readonly draft: Readonly<{
        child: C;
        state: State<S>
        refer: Partial<R>
    }>

    public readonly target: this

    /** @internal */
    public readonly agent: Agent<this, P, E, S, C, R>

    public readonly proxy: Proxy<this, E, S, C>

    public readonly uuid: string

    public get props(): {
        uuid: string
        state: S
        child: C
        refer: Refer<R>
    } {
        return {
            uuid: this.uuid,
            state: { ...this.draft.state },
            child: { ...this.draft.child },
            refer: { ...this.draft.refer },
        }
    }

    // @tranx
    constructor(props: {
        uuid?: string
        state: S extends Record<string, never> ? Record<string, never> : S
        child: C extends Record<string, never> ? Record<string, never> : C
        refer: R extends Record<string, never> ? Record<string, never> : R
    }) {
        this.target = this;
        this.uuid = props.uuid ?? uuidv4();
        this.proxy = new Proxy(this);
        this.agent = {
            event: new EventAgent<this, E>(this),
            route: new RouteAgent<this, P>(this),
            refer: new ReferAgent<this, R>(this),
            state: new StateAgent<this, S>(this, props.state as S),
            child: new ChildAgent<this, C>(this, props.child as C),
        }
        this.event = this.agent.event.current;
        this.draft = {
            state: this.agent.state.draft,
            child: this.agent.child.draft,
            refer: this.agent.refer.draft,
        }
        this.agent.refer.init(props.refer as R);
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

    public debug() {
        const dependency = {
            event: this.agent.event.debug().map(item => item.name),
            state: this.agent.state.debug().map(item => item.name),
            refer: this.agent.refer.debug().map(item => item.name),
        }
        console.log('debug', dependency);
    }
}


