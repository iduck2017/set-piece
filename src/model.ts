import { EventUtil } from "./utils/event";
import { StateUtil } from "./utils/state";
import { RouteUtil } from "./utils/route";
import { ChildUtil } from "./utils/child";
import { ProxyUtil } from "./utils/proxy";
import { ReferUtil } from "./utils/refer";
import { TranxUtil } from "./utils/tranx";
import { EventEmitter } from "./types/event";
import { Utils } from "./utils";
import { Format, Props, Route } from "./types/model";
import { DebugUtil } from "./utils/debug";
import { Func } from "./types";

@TranxUtil.span(true)
export abstract class Model<
    E extends Props.E = {},
    S extends Props.S = {},
    C extends Props.C = {},
    R extends Props.R = {},
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

    public get state(): Readonly<Format.State<S>> { return this.utils.state.current; } 
    public get refer(): Readonly<Format.Refer<R>> { return this.utils.refer.current; }
    public get child(): Readonly<Format.Child<C>> { return this.utils.child.current; }
    public get route(): Readonly<Route> { return this.utils.route.current; }
    
    protected readonly event: Readonly<{ [K in keyof E]: EventEmitter<E[K]> }>;
    protected readonly draft: Readonly<{
        child: C;
        state: Format.State<S>
        refer: Format.Refer<R, true>
    }>

    /** @internal */
    public readonly utils: Utils<this, E, S, C, R>
    public readonly proxy: ProxyUtil<this, E, S, C>

    public get props(): {
        uuid?: string
        state?: Partial<Format.State<S>>,
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

    constructor(loader: Func<{
        uuid: string | undefined;
        state: Format.State<S>;
        child: C;
        refer: R;
    }, []>) {
        const props = loader();
        this.uuid = props.uuid ?? Model.uuid;
        this.proxy = new ProxyUtil(this);
        this.utils = {
            route: new RouteUtil(this),
            event: new EventUtil(this),
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
        return this.utils.route.reload()
    }

    public copy(props?: {
        state?: Partial<Format.State<S>>,
        child?: Partial<C>,
        refer?: Partial<R>,
    }): this {
        const type: any = this.constructor;
        const copy = new type(() => ({
            uuid: undefined,
            state: { ...this.props.state, ...props?.state },
            child: { ...this.props.child, ...props?.child },
            refer: { ...this.props.refer, ...props?.refer },
        }));
        return copy;
    }

    @DebugUtil.log()
    public debug() {
        this.utils.event.debug()
        this.utils.state.debug()
        this.utils.refer.debug()
    }
}


