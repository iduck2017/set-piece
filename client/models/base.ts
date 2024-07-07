import { BaseRecord } from "../types/base";
import { ModelStatus } from "../types/status";
import { 
    BaseModelDict,
    BaseEvent,
    BaseModelList,
    BaseModel,
    ModelChunk, 
    ModelStruct
} from "../types/model";
import type { App } from "../app";
import { ModelProvider } from "../utils/model-provider";
import { ModelConsumer } from "../utils/model-consumer";
import { ModelNode } from "../utils/model-node";
import { ModelData } from "../utils/model-data";

export abstract class Model<
    M extends number,
    R extends BaseRecord,
    I extends BaseRecord,
    S extends BaseRecord,
    E extends BaseEvent,
    H extends BaseEvent,
    P extends BaseModel,
    L extends BaseModelList,
    D extends BaseModelDict,
> {
    private _app?: App;
    public get app() { 
        const app = this._app;
        if (!app) {
            throw new Error();
        }
        return app;
    }

    private _referId?: string;
    public get referId(): string {
        const referId = this._referId;
        if (!referId) {
            throw new Error();
        }
        return referId;
    }

    public readonly modelId: M;

    private _status: ModelStatus;
    public get status() { return this._status; }

    public readonly data: ModelData<R, I, S>;
    public readonly node: ModelNode<P, L, D>;

    public readonly provider: ModelProvider<E>;
    public readonly consumer: ModelConsumer<H>;

    public readonly debugger: BaseEvent;

    public constructor(config: ModelStruct<M, R, I, S, E, H, L, D>) {
        this._status = ModelStatus.INITED;

        this.modelId = config.modelId;
        this._referId = config.referId;

        this.node = new ModelNode({
            list: config.list,
            dict: config.dict
        });

        this.data = new ModelData({
            rule: config.rule,
            info: config.info,
            stat: config.stat
        });

        this.provider = new ModelProvider({
            raw: config.provider
        });
        this.consumer = new ModelConsumer({
            raw: config.consumer,
            handlers: config.handlers
        });

        this.debugger = {};
    }

    public mount(options: {
        app: App,    
        parent: P
    }) {
        this._status = ModelStatus.MOUNTING;
        this._app = options.app;
        
        if (!this._referId) {
            this._referId = this.app.refer.register();
        }
        this.app.refer.add(this);
        
        this.provider._mount({ container: this });
        this.consumer._mount({ container: this });
        this.data._mount({ container: this });
        this.node._mount({
            container: this,
            parent: options.parent 
        });

        for (const child of this.node.children) {
            child.mount({
                app: options.app,
                parent: this
            });
        }

        this._status = ModelStatus.MOUNTED;
    }
    
    public unmount() {
        this._status = ModelStatus.UNMOUNTING;
        this.app.refer.remove(this);
        for (const child of this.node.children) {
            child.unmount();
        }
        this._status = ModelStatus.UNMOUNTED; 
    }

    public serialize(): ModelChunk<M, R, S, E, H, L, D> {
        return {
            modelId: this.modelId,
            referId: this.referId,
            ...this.node._serialize(),
            ...this.data._serialize(),
            ...this.provider._serialize(),
            ...this.consumer._serialize()
        };
    }
}
