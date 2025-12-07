import { ProxyPlugin } from "./plugins/proxy";
import { EventPlugin } from "./plugins/event";
import { StatePlugin } from "./plugins/state";
import { Decor } from "./types/decor";
import { ChildPlugin } from "./plugins/child";
import { ReferPlugin } from "./plugins/refer";
import { Plugins } from "./plugins";
import { Route, RoutePlugin } from "./plugins/route";
import { ChunkService } from "./services/chunk";
import { TranxService } from "./services/tranx";
import { Child, Refer, State } from "./types/model";
import { Emitter } from "./types/event";


export namespace Model {
    export type E = Record<string, any>
    export type S = Record<string, any>
    export type C = Record<string, Model | Model[] | undefined>
    export type R = Record<string, Model | Model[] | undefined>
}

@TranxService.span(true)
export class Model<
    E extends Model.E = {},
    S extends Model.S = {},
    C extends Model.C = {},
    R extends Model.R = {}
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
    public readonly utils: Plugins<Model, E, S, C, R>
    public proxy: ProxyPlugin<this, E, S, C>;

    
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
        this.uuid = props.uuid ?? ChunkService.uuid;
        this.proxy = new ProxyPlugin(this, []);
        this.utils = {
            event: new EventPlugin<Model, E>(this),
            route: new RoutePlugin<Model>(this),
            refer: new ReferPlugin<Model, R>(this, props.refer),
            state: new StatePlugin<Model, S>(this, props.state),
            child: new ChildPlugin<Model, C>(this, props.child),
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
        return this.utils.route.preload(new Set())
    }


    public debug() {
        console.log(Reflect.get(this.utils.event, 'router'))
    }
}

