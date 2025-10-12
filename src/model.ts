import { ProxyUtil } from "./utils/proxy";
import { Emitter, EventUtil, Handler, Producer } from "./utils/event";
import { State, StateUtil } from "./utils/state";
import { Decor } from "./types/decor";
import { Child, ChildUtil } from "./utils/child";
import { Refer, ReferUtil } from "./utils/refer";
import { Utils } from "./utils";
import { Route, RouteUtil } from "./utils/route";
import { TemplUtil } from "./utils/templ";
import { TranxUtil } from "./utils/tranx";

export type Frame<M extends Model> = {
    state: M['state']
    child: M['child']
    refer: M['refer'],
    route: M['route']
}

export namespace Model {
    export type E = Record<string, any>
    export type S = Record<string, any>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
}

@TranxUtil.span(true)
export class Model<
    E extends Record<string, any> = {},
    S extends Record<string, any> = {},
    C extends Record<string, Model | Model[]> = {},
    R extends Record<string, Model | Model[]> = {}
> {
    public uuid: string;
    public get name() {
        return this.constructor.name;
    }
    
    public get state(): Readonly<State<S>> {
        return this.utils.state.current;
    }

    public get child(): Readonly<Child<C>> {
        return this.utils.child.current;
    }
    
    public get refer(): Readonly<Refer<R>> {
        return this.utils.refer.current;
    }

    protected event: { [K in keyof E]: Emitter<E[K]> }

    /** @internal */
    public readonly utils: Utils<Model, E, S, C, R>
    public proxy: ProxyUtil<this, E, S, C>;

    
    public get decor(): Decor<S> | undefined {
        return undefined;
    }

    public get route(): Route {
        return this.utils.route.current;
    }

    protected origin: {
        state: State<S>,
        child: C;
        refer: Partial<R>;
        route: Route;
    }

    constructor(props: {
        uuid: string | undefined
        state: S & { _never?: never },
        child: C & { _never?: never },
        refer: R & { _never?: never }
    }) {
        this.uuid = props.uuid ?? TemplUtil.uuid;
        this.proxy = new ProxyUtil(this);
        this.utils = {
            event: new EventUtil<Model, E>(this),
            route: new RouteUtil<Model>(this),
            refer: new ReferUtil<Model, R>(this, props.refer),
            state: new StateUtil<Model, S>(this, props.state),
            child: new ChildUtil<Model, C>(this, props.child),
        }
        this.event = this.utils.event.current as any;
        this.origin = {
            state: this.utils.state.origin,
            child: this.utils.child.origin,
            refer: this.utils.refer.origin as any,
            route: this.utils.route.origin,
        }
    }

    public get props(): {
        uuid?: string;
        state?: Partial<S & { _never?: never }>
        child?: Partial<C & { _never?: never }>
        refer?: Partial<R & { _never?: never }>
    } {
        return {
            uuid: this.uuid,
            state: this.state,
            child: this.child as any,
            refer: this.refer as any,
        }
    }

    public reload() { 
        return this.utils.route.toReload(new Set())
    }

    
}

