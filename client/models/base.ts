import { ModelStatus } from "../types/status";
import { 
    BaseEvent,
    ModelChunk, 
    BaseTmpl, 
    BaseConf
} from "../types/model";
import type { App } from "../app";
import { ModelConsumer } from "../utils/model-consumer";
import { ModelNode } from "../utils/model-node";
import { ModelData } from "../utils/model-data";
import { ModelProvider } from "../utils/model-provider";

export abstract class Model<M extends BaseTmpl> {
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

    private _status: ModelStatus;
    public get status() { return this._status; }

    public readonly modelId: M[0];
    public readonly data: ModelData<M[1], M[2], M[3]>;
    public readonly node: ModelNode<M[4], M[5], M[6]>;
    public readonly provider: ModelProvider<M[7]>;
    public readonly consumer: ModelConsumer<M[8]>;

    public readonly debugger: BaseEvent;

    public constructor(config: BaseConf<M>) {
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
        parent: M[4]
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

    public serialize(): ModelChunk<M> {
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
