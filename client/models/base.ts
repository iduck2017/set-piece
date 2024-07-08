import { ModelStatus } from "../types/status";
import { 
    BaseIntf,
    ModelIntf,
    BaseRefer
} from "../types/model";
import { TmplId, BaseTmpl } from "../types/tmpl";
import type { App } from "../app";
import { ModelNode } from "../utils/model-node";
import { Data } from "../utils/data";
import { Emitter } from "../utils/emitter";
import { Handler } from "../utils/handler";

import { BaseConf } from "../types/conf";
import { BaseChunk } from "../types/chunk";

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

    private _refer;

    private readonly _recver: Handler<M[TmplId.RECVER]>;
    private readonly _sender: Emitter<ModelIntf<M[TmplId.SENDER]>>;

    public readonly modelId: M[TmplId.ID];
    public readonly data: Data<
        M[TmplId.RULE], 
        M[TmplId.INFO], 
        M[TmplId.STAT]
    >;
    public readonly node: ModelNode<
        M[TmplId.LIST], 
        M[TmplId.DICT], 
        M[TmplId.PARENT]
    >;

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

        this._sender = new Emitter({
            target: {}
        });
        this._recver = new Handler({
            map: {},
            intf: config.intf
        });

        this._refer = {
            sender: config.sender,
            recver: config.recver
        };
        this.debugger = {};

        /** intf */
        this.bind = this._sender.bind.bind(this._sender);
        this.emit = this._sender._intf;
    }

    public mount(options: {
        app: App,    
        parent: M[TmplId.PARENT]
    }) {
        this._status = ModelStatus.MOUNTING;
        this._app = options.app;

        /** provider */
        for (const key in this._refer.sender) {
            const list = this._refer.sender[key];
            if (list) {
                for (const id of list) {
                    const model = this.app.refer.get<Model<any>>(id);
                    if (model) {
                        this._sender.bind(key, model._recver);
                    }
                }
            }
        }
        /** consumer */
        for (const key in this._refer.recver) {
            const list = this._refer.recver[key];
            if (list) {
                for (const id of list) {
                    const model = this.app.refer.get<Model<any>>(id);
                    if (model) {
                        model._sender.bind(key, this._recver);
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

    public serialize(): BaseChunk<M> {
        /** provider */
        const emitter: BaseRefer<ModelIntf<M[7]>> = {};
        for (const key in this._sender._map) {
            if (!emitter[key]) {
                emitter[key as keyof M[7]] = [];
            }
            const list = this._sender._map[key];
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
        const handler: BaseRefer<M[8]> = {};
        for (const key in this._recver._map) {
            if (!handler[key]) {
                handler[key] = [];
            }
            const list = this._recver._map[key];
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
            sender: emitter,
            recver: handler
        };
    }
}
