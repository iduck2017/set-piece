import { EventAgent  } from "./agent/event";
import { StateAgent } from "./agent/state";
import { RouteAgent } from "./agent/route";
import { ChildAgent } from "./agent/child";
import { Proxy } from "./proxy";
import { DeepReadonly, Primitive } from "utility-types";
import { ReferAgent } from "./agent/refer";
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
    S extends Model.S = {},
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

export class Model<
    P extends Model.P = Model.P,
    E extends Model.E = {},
    S extends Model.S = {},
    C extends Model.C = {},
    R extends Model.R = {},
> {
    public get state(): DeepReadonly<S> {
        return this.agent.state.current as any;
    } 
    
    public get refer(): Readonly<{ [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }> { 
        return this.agent.refer.current; 
    }

    public get child(): Readonly<{ [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }> { 
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
        state: { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }; 
        refer: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }
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
        refer: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }
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
        state: S
        child: C
        refer: { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
    }) {
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


