import { BaseData, BaseEvent, VoidData } from "../types/base";
import { ModelStatus } from "../types/status";
import { 
    BaseModel,
    ModelChunk, 
    ModelConfig, 
    ModelEvent
} from "../types/model";
import type { App } from "../app";
import { EventId } from "../types/events";
import { Node } from "../utils/node";
import { ModelProvider } from "../utils/model-provider";
import { ModelConsumer } from "../utils/model-consumer";
import { Data } from "../utils/data";


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

    private _provider: { [K in keyof ModelEvent<E>]?: string[] };
    private _consumer: { [K in keyof H]?: string[] };

    public readonly provider: ModelProvider<ModelEvent<E>>;
    public readonly abstract consumer: ModelConsumer<H>;
    public readonly data: Data<R, I, S, BaseModel>;
    public readonly node: Node<BaseModel, BaseModel, VoidData, BaseModel>;

    public readonly debugger: BaseEvent;

    public constructor(config: ModelConfig<M, E, H, R, I, S>) {
        this._status = ModelStatus.INITED;

        this.modelId = config.modelId;
        this.referId = config.referId || this.app.refer.register();

        this.provider = new ModelProvider();
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

        this._provider = config.provider;
        this._consumer = config.consumer;
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

    public mount(
        app: App,    
        parent: P
    ) {
        this._status = ModelStatus.MOUNTING;
        this._app = app;
        this.app.refer.add(this);
        
        this.provider._mount(this);
        this.consumer._mount(this);

        this.data._mount(this);
        this.node._mount(this);
        this._parent = parent;
        for (const child of this.children) {
            child.mount(app, this);
        }
        this._status = ModelStatus.MOUNTED;
    }
    
    public unmount() {
        this._status = ModelStatus.UNMOUNTING;

        for (const child of this.children) child.unmount();
        this.app.refer.remove(this);
        this._parent = undefined; 
        
        this._status = ModelStatus.UNMOUNTED; 
    }

    public serialize(): ModelChunk<M, E, H, R, S> {
        return {
            modelId: this.modelId,
            referId: this.referId,
            rule: this.data._rule,
            stat: this.data._stat,
            provider: this.provider._serialize(),
            consumer: this.consumer._serialize()
        };
    }
}
