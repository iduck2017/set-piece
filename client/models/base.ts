import { ModelStatus } from "../types/status";
import { 
    BaseIntf,
    ModelChunk, 
    BaseTmpl, 
    BaseConf,
    ModelIntf
} from "../types/model";
import type { App } from "../app";
import { ModelNode } from "../utils/model-node";
import { Data } from "../utils/model-data";
import { ModelRefer } from "../types/common";
import { Emitter } from "../utils/emitter";
import { Handler } from "../utils/handler";

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

    public readonly _handler: Handler<M[8]>;
    public readonly _emitter: Emitter<ModelIntf<M[7]>>;
    private readonly _emitterRefer: ModelRefer<ModelIntf<M[7]>>;
    private readonly _handlerRefer: ModelRefer<M[8]>;

    public readonly modelId: M[0];
    public readonly data: Data<M[1], M[2], M[3]>;
    public readonly node: ModelNode<M[4], M[5], M[6]>;

    public readonly debugger: BaseIntf;

    public constructor(config: BaseConf<M>) {
        this._status = ModelStatus.INITED;

        this.modelId = config.modelId;
        this._referId = config.referId;

        this.node = new ModelNode({
            list: config.list,
            dict: config.dict
        });

        this.data = new Data({
            rule: config.rule,
            info: config.info,
            stat: config.stat
        });

        this._emitter = new Emitter({
            list: {}
        });
        this._handler = new Handler({
            list: {},
            intf: config.handlers
        });

        this._emitterRefer = config.emitter;
        this._handlerRefer = config.handler;

        this.debugger = {};
    }

    public mount(options: {
        app: App,    
        parent: M[4]
    }) {
        this._status = ModelStatus.MOUNTING;
        this._app = options.app;

        /** provider */
        for (const key in this._emitterRefer) {
            const list = this._emitterRefer[key];
            if (list) {
                for (const id of list) {
                    const model = this.app.refer.get<Model<any>>(id);
                    if (model) {
                        this._emitter.bind(key, model._handler);
                    }
                }
            }
        }
        /** consumer */
        for (const key in this._handlerRefer) {
            const list = this._handlerRefer[key];
            if (list) {
                for (const id of list) {
                    const model = this.app.refer.get<Model<any>>(id);
                    if (model) {
                        model._emitter.bind(key, this._handler);
                    }
                }
            }
        }


        if (!this._referId) {
            this._referId = this.app.refer.register();
        }
        this.app.refer.add(this);
        
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
        /** provider */
        const emitterRefer: ModelRefer<ModelIntf<M[7]>> = {};
        for (const key in this._emitter._list) {
            if (!emitterRefer[key]) {
                emitterRefer[key as keyof M[7]] = [];
            }
            const list = this._emitter._list[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof Handler) {
                        const container = item.container;
                        emitterRefer[key]!.push(container.referId);
                    }
                }
            }
        }
        /** consumer */
        const handlerRefer: ModelRefer<M[8]> = {};
        for (const key in this._handler._list) {
            if (!handlerRefer[key]) {
                handlerRefer[key] = [];
            }
            const list = this._handler._list[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof Emitter) {
                        const container = item.container;
                        handlerRefer[key]!.push(container.referId);
                    }
                }
            }
        }

        return {
            modelId: this.modelId,
            referId: this.referId,
            ...this.node._serialize(),
            ...this.data._serialize(),
            emitter: emitterRefer,
            handler: handlerRefer
        };
    }
}
