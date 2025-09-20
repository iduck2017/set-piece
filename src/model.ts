import { EventUtil } from "./utils/event";
import { StateUtil } from "./utils/state";
import { RouteUtil } from "./utils/route";
import { ChildUtil } from "./utils/child";
import { ProxyUtil } from "./utils/proxy";
import { ReferUtil } from "./utils/refer";
import { TranxUtil } from "./utils/tranx";
import { Emitter } from "./types/event";
import { Utils } from "./utils";
import { Child, Props, Refer, Route, State } from "./types/model";
import { DebugUtil } from "./utils/debug";
import { Method } from "./types";
import { Decor } from "./types/decor";

@TranxUtil.span(true)
export abstract class Model<
    E extends Props.E = {},
    S extends Props.S = {},
    C extends Props.C = {},
    R extends Props.R = {},
    P extends Props.P = {},
> {
    private static ticket: number = 36 ** 7;
    private static get uuid() {
        let time = Date.now();
        const ticket = Model.ticket += 1;
        if (Model.ticket >= 36 ** 8) {
            Model.ticket = 36 ** 7;
            while (Date.now() === time) {}
            time = Date.now();
        };
        return `${time.toString(36)}-${ticket.toString(36)}`;
    }

    public readonly uuid: string
    public get name() { return this.constructor.name; }
    
    public get state(): Readonly<State<S>> { return this.utils.state.current; } 
    public get refer(): Readonly<Refer<R, false>> { return this.utils.refer.current; }
    public get child(): Readonly<Child<C>> { return this.utils.child.current; }
    public get route(): Readonly<Route<P>> { return this.utils.route.current; }
    public get decor(): Decor<S> { return new Decor(this); }
    
    protected readonly event: Readonly<{ [K in keyof E]: Emitter<E[K]> }>;
    protected readonly draft: Readonly<{
        child: C;
        state: State<S>
        refer: Refer<R, true>
    }>

    /** @internal */
    public readonly utils: Utils<this, E, S, C, R, P>
    public readonly proxy: ProxyUtil<this, E, S, C>

    public get props(): {
        uuid?: string
        state?: Partial<State<S>>,
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

    constructor(loader: Method<{
        uuid: string | undefined;
        state: State<S>;
        child: C;
        refer: R;
        route: P,
    }, []>) {
        const props = loader();
        this.uuid = props.uuid ?? Model.uuid;
        this.proxy = new ProxyUtil(this);
        this.utils = {
            event: new EventUtil(this),
            route: new RouteUtil<this, P>(this, props.route),
            refer: new ReferUtil<this, R>(this, props.refer),
            state: new StateUtil<this, S>(this, props.state),
            child: new ChildUtil<this, C>(this, props.child),
        }
        this.event = this.utils.event.current;
        this.draft = {
            state: this.utils.state.origin,
            child: this.utils.child.origin,
            refer: this.utils.refer.origin,
        }
    }

    public reload() { 
        return this.utils.route.toReload(new Set())
    }

    @DebugUtil.log()
    public debug() {
        this.utils.event.debug()
        this.utils.state.debug()
        this.utils.refer.debug()
    }
}


