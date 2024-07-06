import { BaseData, BaseEvent } from "../types/base";
import { ModelStatus } from "../types/status";
import { 
    BaseModel,
    ChunkOf,
    ModelChunk, 
    ModelConfig 
} from "../types/model";
import type { App } from "../app";
import { ModelProvider } from "../utils/model-provider";
import { ModelConsumer } from "../utils/model-consumer";
import { Data } from "../utils/data";
import { ModelNode } from "../utils/model-node";

export abstract class Model<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    P extends BaseModel | App,
    C extends BaseModel,
    D extends Record<string, C>
> {
    private _app?: App;
    public get app() { 
        const app = this._app;
        if (!app) {
            throw new Error();
        }
        return app;
    }

    public readonly referId: string;
    public readonly modelId: M;

    private _status: ModelStatus;
    public get status() { return this._status; }

    public readonly data: Data<
        R, 
        I, 
        S, 
        BaseModel
    >;
    public readonly node: ModelNode<
        BaseModel | App, 
        C, 
        D
    >;

    public readonly provider: ModelProvider<E>;
    public readonly abstract consumer: ModelConsumer<H>;

    public readonly debugger: BaseEvent;

    public constructor(config: ModelConfig<M, E, H, R, I, S, C, D>) {
        this._status = ModelStatus.INITED;

        this.modelId = config.modelId;
        this.referId = config.referId || this.app.refer.register();

        this.provider = new ModelProvider({
            raw: config.provider
        });

        this.node = new ModelNode({
            dict: config.dict,
            children: config.children
        });

        this.data = new Data({
            rule: config.rule,
            info: config.info,
            stat: config.stat,
            handlers: this.provider._emitters
        });

        this.debugger = {};
    }

    public mount(options: {
        app: App,    
        parent: P
    }) {
        this._status = ModelStatus.MOUNTING;
        this._app = options.app;
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

    public serialize(): ModelChunk<M, E, H, R, S, C, D> {
        const chunks: ChunkOf<C>[] = [];
        for (const child of this.node.children) {
            chunks.push(child.serialize() as ChunkOf<C>);
        }

        return {
            modelId: this.modelId,
            referId: this.referId,
            rule: this.data._rule,
            stat: this.data._stat,
            provider: this.provider._serialize(),
            consumer: this.consumer._serialize(),
            children: chunks,
            dict: this.node._dict
        };
    }
}
