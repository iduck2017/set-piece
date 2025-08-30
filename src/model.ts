import { EventUtil } from "./utils/event";
import { StateUtil } from "./utils/state";
import { RouteUtil } from "./utils/route";
import { ChildUtil } from "./utils/child";
import { ProxyUtil } from "./utils/proxy";
import { ReferUtil } from "./utils/refer";
import { TranxUtil } from "./utils/tranx";
import { EventEmitter } from "./types/event";
import { Utils } from "./utils";
import { Get, Props, Set } from "./types/model";

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

    public get state(): Get.State<S> { return this.utils.state.current; } 
    public get refer(): Get.Refer<R> { return this.utils.refer.current; }
    public get child(): Get.Child<C> { return this.utils.child.current; }
    public get route(): Get.Route { return this.utils.route.current; }
    
    protected readonly event: Readonly<{ [K in keyof E]: EventEmitter<E[K]> }>;
    protected readonly draft: Readonly<{
        child: C;
        state: Set.State<S>
        refer: Set.Refer<R>
    }>

    /** @internal */
    public readonly utils: Utils<this, E, S, C, R>
    public readonly proxy: ProxyUtil<this, E, S, C>

    public get props(): {
        uuid?: string
        state?: Partial<Set.State<S>>,
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
        state: Set.State<S>;
        child: C;
        refer: R;
    }) {
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
            state: this.utils.state.draft,
            child: this.utils.child.draft,
            refer: this.utils.refer.draft,
        }
        this.utils.refer.reload();
    }

    public reload() { 
        return this.utils.route.reload()
    }

    public copy(props?: {
        state?: Partial<S>,
        child?: Partial<C>,
        refer?: Partial<R>,
    }): this {
        const type: any = this.constructor;
        const copy = new type({
            uuid: undefined,
            state: { ...this.props.state, ...props?.state },
            child: { ...this.props.child, ...props?.child },
            refer: { ...this.props.refer, ...props?.refer },
        });
        console.warn('copy', this.name);
        return copy;
    }

    public debug() {
        const dependency = {
            event: this.utils.event.debug().map(item => item.name),
            state: this.utils.state.debug().map(item => item.name),
            refer: this.utils.refer.debug().map(item => item.name),
        }
        console.log('debug', dependency);
    }
}


