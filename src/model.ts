import { EventUtil  } from "./utils/event";
import { StateUtil } from "./utils/state";
import { RouteUtil } from "./utils/route";
import { ChildUtil } from "./utils/child";
import { AgentUtil } from "./utils/agent";
import { ReferUtil } from "./utils/refer";
import { TranxUtil } from "./utils/tranx";
import { State, Refer, Child } from "./types/model";
import { EventEmitter } from "./types/event";

type Agent<
    M extends Model = Model,
    E extends Model.Event = Model.Event,
    S extends Model.State = Model.State,
    C extends Model.Child = Model.Child,
    R extends Model.Refer = Model.Refer,
> = Readonly<{
    event: EventUtil<M, E>
    route: RouteUtil<M>
    state: StateUtil<M, S>
    child: ChildUtil<M, C>
    refer: ReferUtil<M, R>
}>


export namespace Model {
    export type Parent = Model
    export type Event = Record<string, any>
    export type State = Record<string, any>
    export type Child = Record<string, Model | Model[]>
    export type Refer = Record<string, Model | Model[]>
}

@TranxUtil.span(true)
export class Model<
    E extends Model.Event = {},
    S extends Model.State = {},
    C extends Model.Child = {},
    R extends Model.Refer = {},
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
    public get refer(): Readonly<Refer<R>> { return this.utils.refer.current; }
    public get child(): Readonly<Child<C>> { return this.utils.child.current; }
    public get route(): Readonly<Partial<{
        root: Model,
        parent: Model,
    }>> { 
        return { 
            root: this.utils.route.root,
            parent: this.utils.route.parent,
        }
    }
    
    public get status() {
        return {
            isLoad: this.utils.route.isLoad,
            isBind: this.utils.route.isBind,
            isRoot: this.utils.route.isRoot,
        }
    }

    protected readonly event: Readonly<{ [K in keyof E]: EventEmitter<E[K]> }>;
    protected readonly draft: Readonly<{
        child: C;
        state: State<S>
        refer: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }
    }>

    /** @internal */
    public readonly utils: Agent<this, E, S, C, R>
    public readonly proxy: AgentUtil<this, E, S, C>

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
        this.uuid = props.uuid ?? Model.uuid;
        this.proxy = new AgentUtil(this);
        this.utils = {
            event: new EventUtil<this, E>(this),
            route: new RouteUtil<this>(this),
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
        this.utils.refer.reset();
    }

    public reload() { this.utils.route.reload(); }

    public copy(): this {
        const type: any = this.constructor;
        const copy = new type({
            ...this.props,
            uuid: undefined
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


