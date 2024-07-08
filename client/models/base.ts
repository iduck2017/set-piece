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

    private _config;
    private readonly _handler: Handler<M[8]>;
    private readonly _emitter: Emitter<ModelIntf<M[7]>>;

    public readonly modelId: M[0];
    public readonly data: Data<M[1], M[2], M[3]>;
    public readonly node: ModelNode<M[4], M[5], M[6]>;

    public readonly debugger: BaseIntf;

    public bind;
    public emit;

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
            target: {}
        });
        this._handler = new Handler({
            map: {},
            intf: config.intf
        });

        this._config = {
            emitter: config.emitter,
            handler: config.handler
        };
        this.debugger = {};

        /** intf */
        this.bind = this._emitter.bind.bind(this._emitter);
        this.emit = this._emitter._intf;
    }

    public mount(options: {
        app: App,    
        parent: M[4]
    }) {
        this._status = ModelStatus.MOUNTING;
        this._app = options.app;

        /** provider */
        for (const key in this._config.emitter) {
            const list = this._config.emitter[key];
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
        for (const key in this._config.handler) {
            const list = this._config.handler[key];
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
        const emitter: ModelRefer<ModelIntf<M[7]>> = {};
        for (const key in this._emitter._map) {
            if (!emitter[key]) {
                emitter[key as keyof M[7]] = [];
            }
            const list = this._emitter._map[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof Handler) {
                        const container = item.container;
                        emitter[key]!.push(container.referId);
                    }
                }
            }
        }
        /** consumer */
        const handler: ModelRefer<M[8]> = {};
        for (const key in this._handler._map) {
            if (!handler[key]) {
                handler[key] = [];
            }
            const list = this._handler._map[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof Emitter) {
                        const container = item.container;
                        handler[key]!.push(container.referId);
                    }
                }
            }
        }

        return {
            modelId: this.modelId,
            referId: this.referId,
            ...this.node._serialize(),
            ...this.data._serialize(),
            emitter,
            handler
        };
    }
}
