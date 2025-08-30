import { EventUtil } from "./utils/event";
import { StateUtil } from "./utils/state";
import { RouteUtil } from "./utils/route";
import { ChildUtil } from "./utils/child";
import { ProxyUtil } from "./utils/proxy";
import { ReferUtil } from "./utils/refer";
import { TranxUtil } from "./utils/tranx";
import { EventEmitter } from "./types/event";
import { Utils } from "./utils";
import { Primitive } from "utility-types";
import { Props } from "./types/model";
import { StateChangeEvent, ChildChangeEvent, ReferChangeEvent, RouteChangeEvent } from "./types/model";

export namespace Model {
    export type Route = { root: Model, order: Model[], parent?: Model }
    export type State<S extends Props.S = {}> = { [K in keyof S]: S[K] extends Primitive ? S[K] : Readonly<S[K]> }
    export type Child<C extends Props.C = {}> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
    export type Refer<R extends Props.R = {}> = { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
    export type Event<E, M extends Model> = E & {
        onStateChange: StateChangeEvent<M>
        onChildChange: ChildChangeEvent<M>;
        onReferChange: ReferChangeEvent<M>;
        onRouteChange: RouteChangeEvent<M>;
    }
}

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

    public get state(): Readonly<Model.State<S>> { return this.utils.state.current; } 
    public get refer(): Readonly<Model.Refer<R>> { return this.utils.refer.current; }
    public get child(): Readonly<Model.Child<C>> { return this.utils.child.current; }
    public get route(): Readonly<Model.Route> { return this.utils.route.current; }
    
    protected readonly event: Readonly<{ [K in keyof E]: EventEmitter<E[K]> }>;
    protected readonly draft: Readonly<{
        child: C;
        state: Model.State<S>
        refer: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }
    }>

    /** @internal */
    public readonly utils: Utils<this, E, S, C, R>
    public readonly proxy: ProxyUtil<this, E, S, C>

    public get props(): {
        uuid?: string
        state?: Partial<Model.State<S>>,
        child?: Partial<Model.Child<C>>,
        refer?: Partial<Model.Refer<R>>,
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


