import { EventAgent  } from "./agent/event";
import { StateAgent } from "./agent/state";
import { RouteAgent } from "./agent/route";
import { ChildAgent } from "./agent/child";
import { Proxy } from "./utils/proxy";
import { ReferAgent } from "./agent/refer";
import { v4 as uuidv4 } from 'uuid';
import { TranxService } from "./service/tranx";
import { State, Refer, Child, Props } from "./types";

type Agent<
    M extends Model = Model,
    P extends Model.Parent = Model.Parent,
    E extends Model.Event = Model.Event,
    S extends Model.State = Model.State,
    C extends Model.Child = Model.Child,
    R extends Model.Refer = Model.Refer,
> = Readonly<{
    event: EventAgent<M, E>
    route: RouteAgent<M, P>
    state: StateAgent<M, S>
    child: ChildAgent<M, C>
    refer: ReferAgent<M, R>
}>


export namespace Model {
    export type Parent = Model
    export type Event = Record<string, any>
    export type State = Record<string, any>
    export type Child = Record<string, Model | Model[]>
    export type Refer = Record<string, Model | Model[]>
}

@TranxService.use(true)
export class Model<
    P extends Model.Parent = Model.Parent,
    E extends Model.Event = {},
    S extends Model.State = {},
    C extends Model.Child = {},
    R extends Model.Refer = {},
> {
    public get name() { return this.constructor.name; }

    public get state(): Readonly<State<S>> { return this.agent.state.current as any; } 
    
    public get refer(): Readonly<Refer<R>> { return this.agent.refer.current; }

    public get child(): Readonly<Child<C>> { return this.agent.child.current; }

    public get route(): Readonly<{
        parent?: P
        root?: Model
    }> {
        return {
            parent: this.agent.route.parent,
            root: this.agent.route.root,
        };
    }

    public get status() {
        return {
            isLoad: this.agent.route.isLoad,
            isBind: this.agent.route.isBind,
            isRoot: this.agent.route.isRoot,
        }
    }

    protected readonly event: Readonly<{ [K in keyof E]: (event: E[K]) => void }>;

    protected readonly draft: Readonly<{
        child: C;
        state: State<S>
        refer: Partial<R>
    }>


    /** @internal */
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

    constructor(props: {
        uuid: string | undefined;
        state: S;
        child: C;
        refer: R;
    }) {
        this.uuid = props.uuid ?? uuidv4();
        this.proxy = new Proxy(this);
        this.agent = {
            event: new EventAgent<this, E>(this),
            route: new RouteAgent<this, P>(this),
            refer: new ReferAgent<this, R>(this),
            state: new StateAgent<this, S>(this, props.state),
            child: new ChildAgent<this, C>(this, props.child),
        }
        this.event = this.agent.event.current;
        this.draft = {
            state: this.agent.state.draft,
            child: this.agent.child.draft,
            refer: this.agent.refer.draft,
        }
        this.agent.refer.init(props.refer);
    }

    
    public copy(): this {
        const type: any = this.constructor;
        return new type({
            ...this.props,
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


