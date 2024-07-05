import { BaseData, BaseEvent, VoidData } from "../types/base";
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
import { Consumer, Data, Node, Provider } from "./node";

export abstract class Model<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    P extends BaseModel | App
> {
    protected _app!: App;
    public get app() { return this._app; }

    public readonly referId: string;
    public readonly modelId: M;

    private _status: ModelStatus;
    public get status() { return this._status; }

    private _parent?: P;
    public get parent() { return this._parent; }
    public get children(): BaseModel[] { return []; }

    public readonly provider: Provider<ModelEvent<E>, BaseModel>;
    public readonly abstract consumer: Consumer<H, BaseModel>;
    public readonly data: Data<R, I, S, BaseModel>;
    public readonly node: Node<BaseModel, BaseModel, VoidData, BaseModel>;

    public debugger: BaseEvent;

    public constructor(config: ModelConfig<M, E, H, R, I, S>) {
        this._status = ModelStatus.INITED;

        this.modelId = config.modelId;
        this.referId = config.referId || this.app.refer.register();

        this.provider = new Provider();
        this.data = new Data(
            {
                rule: config.rule,
                info: config.info,
                stat: config.stat
            }, 
            {
                [EventId.CHECK_BEFORE]: this._onCheckBefore.bind(this),
                [EventId.UPDATE_DONE]: this._onUpdateDone.bind(this)
            }
        );
        this.node = new Node({
            children: [],
            dict: {}
        });

        this.debugger = {};
    }

    private _onCheckBefore<
        I extends BaseData,
        S extends BaseData,
        K extends keyof (I & S)
    >(data: {
        target: Data<BaseData, I, S>,
        key: K,
        prev: (I & S)[K],
        next: (I & S)[K],
    }) {
        this.provider._emitters[EventId.CHECK_BEFORE](data);
    }

    private _onUpdateDone<
        I extends BaseData,
        S extends BaseData,
        K extends keyof (I & S)
    >(data: {
        target: Data<BaseData, I, S>,
        key: K,
        prev: (I & S)[K],
        next: (I & S)[K],
    }) {
        this.provider._emitters[EventId.UPDATE_DONE](data);
    }

    @modelStatus(ModelStatus.INITED)
    public mount(
        app: App,    
        parent: P
    ) {
        this._app = app;
        this._status = ModelStatus.MOUNTING;
        this.app.refer.add(this);
        this.provider._mount(this);
        this.consumer._mount(this);
        for (const child of this.children) {
            child.mount(
                app,
                this
            );
        }
        this.data._mount(this);
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

    @modelStatus(
        ModelStatus.INITED,
        ModelStatus.MOUNTED
    )
    public serialize(): ModelChunk<M, E, H, R, S> {
        const provider: { [K in keyof ModelEvent<E>]?: string[] } = {};
        const consumer: { [K in keyof H]?: string[] } = {};

        for (const key in this.consumer._providers) {
            if (!consumer[key]) {
                consumer[key] = [];
            }

            const list = this.consumer._providers[key];
            if (list) {
                for (const item of list) {
                    const container = item.container;
                    if (container instanceof Model) {
                        consumer[key]!.push(container.referId);
                    }
                }
            }
        }

        for (const _key in this.provider._consumers) {
            const key: keyof ModelEvent<E> = _key;
            if (!provider[key]) {
                provider[key] = [];
            }

            const list = this.provider._consumers[key];
            if (list) {
                for (const item of list) {
                    const container = item.container;
                    if (container instanceof Model) {
                        provider[key]!.push(container.referId);
                    }
                }
            }
        }

        return {
            modelId: this.modelId,
            referId: this.referId,
            rule: this.data._rule,
            stat: this.data._stat,
            provider,
            consumer
        };
    }

}
