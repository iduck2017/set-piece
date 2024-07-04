import { BaseData, BaseEvent } from "../types/base";
import { ModelStatus } from "../types/status";
import { modelStatus } from "../utils/status";
import { 
    BaseModel,
    ModelChunk, 
    ModelConfig, 
    ModelEvent
} from "../types/model";
import type { App } from "../app";
import { EventId } from "../types/events";
import { Consumer, Provider } from "./node";

export abstract class Model<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    P extends BaseModel | App
> {
    public readonly app: App;

    public readonly referId: string;
    public readonly modelId: M;

    private _status: ModelStatus;
    public get status() { return this._status; }

    protected readonly _rule: R;
    protected readonly _info: I;
    protected readonly _state: S;

    private readonly _data: R & I & S;
    public get data() { return this._data; }

    private _parent?: P;
    public get parent() { return this._parent; }
    public get children(): BaseModel[] { return []; }

    public readonly provider: Provider<ModelEvent<E>>;
    public readonly abstract consumer: Consumer<H>;

    // private readonly _providerIds: { [K in keyof E]?: string[] };
    // private readonly _consumerIds: { [K in keyof H]?: string[] };
    // private readonly _renderers: { 
    //     [K in keyof H]?: Array<Event<Pick<H, K>, BaseEvent>> 
    // };

    // protected _emitters: H; 
    // protected abstract _handlers: E 
    public debuggers: BaseEvent = {};

    public constructor(
        config: ModelConfig<M, E, H, R, I, S>, 
        app: App
    ) {
        this._status = ModelStatus.INITED;

        this.app = app;
        this.modelId = config.modelId;
        this.referId = config.referId || this.app.refer.register();

        this.provider = new Provider(this);
        
        this._rule = this._proxy(config.rule);
        this._info = this._proxy(config.info);
        this._state = this._proxy(config.state);
        this._data = {
            ...config.rule,
            ...config.info,
            ...config.state
        };

        // this._providers = config.providers;
        // this._consumers = config.consumers;
        // this._renderers = {};

        // this._emitters = new Proxy({}, {
        //     get: (target, key: any) => {
        //         return this._emit.bind(this, key);
        //     }
        // }) as any;
    }

    // @modelStatus(
    //     ModelStatus.MOUNTING,
    //     ModelStatus.MOUNTED
    // )
    // private _emit<K extends keyof H>(
    //     key: K, 
    //     ...data: Parameters<H[K]>
    // ) {
    //     const consumers = this._consumers[key];
    //     const renderers = this._renderers[key];

    //     const callbacks = [];
    //     if (consumers) {
    //         for (const handler of consumers) {
    //             const model = this.app.refer.get<Model<
    //                 number,
    //                 H,
    //                 ModelEvent,
    //                 BaseData,
    //                 BaseData,
    //                 BaseData,
    //                 BaseModel | App
    //             >>(handler);
    //             if (model) {
    //                 callbacks.push(
    //                     model._handlers[key].bind(model)
    //                 );
    //             }
    //         }
    //     }
    //     if (renderers) {
    //         for (const renderer of renderers) {
    //             callbacks.push(
    //                 renderer.handlers[key].bind(renderer)
    //             );
    //         }
    //     }
        
    //     for (const callback of callbacks) {
    //         callback(data);
    //     }
    // }

    @modelStatus(ModelStatus.INITED)
    private _proxy<T extends BaseData>(raw: T): T {
        return new Proxy(raw, {
            set: (target, key, value) => {
                target[key as keyof T] = value;
                this.update(key as keyof (R & I & S));
                return true;
            }
        });
    }
    
    @modelStatus(
        ModelStatus.MOUNTING,
        ModelStatus.MOUNTED
    )
    public update(key: keyof (R & I & S)) {
        const prev = this._data[key];
        const result = {
            ...this._rule,
            ...this._info,
            ...this._state
        }[key];
        const data = {
            target: this,
            key,
            prev: result,
            next: result
        };
        
        this.provider.emit(EventId.CHECK_BEFORE)(data);
        this._data[key] = data.next;
        if (prev !== data.next) {
            const foo = this.provider.emit(EventId.UPDATE_DONE);
            this.provider.emit(EventId.UPDATE_DONE)({
                target: this,
                key,
                prev,
                next: data.next
            });
        }
    }

    @modelStatus(ModelStatus.INITED)
    public mount(parent: P) {
        this._status = ModelStatus.MOUNTING;
        this.app.refer.add(this);
        for (const child of this.children) child.mount(this);
        for (const key in this._rule) this.update(key); 
        for (const key in this._info) this.update(key); 
        for (const key in this._state) this.update(key); 
        this._parent = parent;
        this._status = ModelStatus.MOUNTED;
    }
    
    @modelStatus(ModelStatus.MOUNTED)
    public unmount() {
        this._status = ModelStatus.UNMOUNTING;
        for (const child of this.children) child.unmount();
        this.app.refer.remove(this);
        this._parent = undefined; 
        this._status = ModelStatus.UNMOUNTED; 
    }

    // @modelStatus(ModelStatus.MOUNTED)
    // public bind<K extends keyof H>(
    //     key: K,
    //     that: Renderer<Pick<H, K>>
    // ) {
    //     let renderers = this._renderers[key];
    //     let providers = that.providers[key];

    //     if (!renderers) renderers = this._renderers[key] = [];
    //     if (!providers) providers = that.providers[key] = [];

    //     renderers.push(that);
    //     providers.push(this);
    // }

    // @modelStatus(ModelStatus.MOUNTED)
    // public unbind<K extends keyof H>(
    //     key: K,
    //     that: Renderer<Pick<H, K>>
    // ) {
    //     const providers = that.providers[key];
    //     const renderers = this._renderers[key];

    //     if (!providers || !renderers) throw new Error();

    //     providers.splice(providers.indexOf(this), 1);
    //     renderers.splice(renderers.indexOf(that), 1);
    // }

    // @modelStatus(ModelStatus.MOUNTED)
    // public hook<K extends keyof H>(
    //     key: K,
    //     that: Model<
    //         number,
    //         Pick<H, K>,
    //         ModelEvent,
    //         BaseData,
    //         BaseData,
    //         BaseData,
    //         BaseModel | App
    //     >
    // ) {
    //     let providers = that._providers[key];
    //     let consumers = this._consumers[key];

    //     if (!providers) providers = that._providers[key] = [];
    //     if (!consumers) consumers = this._consumers[key] = [];

    //     providers.push(this.referId);
    //     consumers.push(that.referId);
    // }

    // @modelStatus(ModelStatus.MOUNTED)
    // public unhook<K extends keyof H>(
    //     key: K,
    //     that: Model<
    //         number,
    //         Pick<H, K>,
    //         ModelEvent,
    //         BaseData,
    //         BaseData,
    //         BaseData,
    //         BaseModel | App
    //     >
    // ) {
    //     const providers = that._providers[key];
    //     const consumers = this._consumers[key];
        
    //     if (!providers || !consumers) throw new Error();

    //     providers.splice(providers.indexOf(this.referId), 1);
    //     consumers.splice(consumers.indexOf(that.referId), 1);
    // }

    // public deactive<K extends keyof E>(key: K) {
    //     const providers = this._providers[key];
    //     if (providers) {
    //         for (const provider of providers) {
    //             const model = this.app.refer.get<
    //                     Model<
    //                         number,
    //                         BaseEvent,
    //                         Pick<E, K>,    
    //                         BaseData,
    //                         BaseData,
    //                         BaseData,
    //                         BaseModel | App
    //                     >
    //                 >(provider);
    //             if (model) {
    //                 model.unhook(key, this as any as Model<
    //                         number,
    //                         Pick<ModelEvent<E>, K>,
    //                         BaseEvent,
    //                         BaseData,
    //                         BaseData,
    //                         BaseData,
    //                         BaseModel | App
    //                     >);
    //             }
    //         }
    //     }
    // }
    

    @modelStatus(
        ModelStatus.INITED,
        ModelStatus.MOUNTED
    )
    public serialize(): ModelChunk<M, E, H, R, S> {
        const provider: { [K in keyof ModelEvent<E>]?: string[] } = {};
        const consumer: { [K in keyof H]?: string[] } = {};

        for (const index in this.provider.consumers) {
            const key: keyof ModelEvent<E> = index;

            provider[key] = [];
            const targets = this.provider.consumers[key];
            if (targets) {
                for (const target of targets) {
                    const container = target.container;
                    if (container instanceof Model) {
                        provider[key]!.push(container.referId);
                    }
                }
            }
        }

        for (const index in this.consumer.providers) {
            const key: keyof H = index;

            consumer[key] = [];
            const targets = this.consumer.providers[key];
            if (targets) {
                for (const target of targets) {
                    const container = target.container;
                    if (container instanceof Model) {
                        consumer[key]!.push(container.referId);
                    }
                }
            }
        }

        return {
            modelId: this.modelId,
            referId: this.referId,
            rule: this._rule,
            state: this._state,
            provider,
            consumer
        };
    }

}
