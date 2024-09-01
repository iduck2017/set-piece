import type { App } from "../app";
import type { Model } from "../models";
import { EventDecl } from "../type/event";
import { Emitter } from "./emitter";
import type { Handler } from "./handler";
import type { ModelDecl } from "../type/model";
import type { IModelDef } from "../type/definition";
import { ModelKey } from "../type/registry";

/** 状态修饰器 */
export class Updater<
    M extends IModelDef.Base,
    K extends keyof M[ModelKey.State],
> extends Emitter<
    EventDecl.StateUpdateBefore<M, K>, 
    Model<M>
> {
    /** 状态键值 */
    public readonly key: K;

    constructor(
        config: ModelDecl.UpdaterConfig<K>,
        parent: Model<M>,
        app: App
    ) {
        super(config, parent, app);
        this.key = config.key;
    }

    public bindHandler(handler: Handler<EventDecl.StateUpdateBefore<M, K>>) {
        super.bindHandler(handler);
        this.parent.updateState(this.key);
    }

    public unbindHandler(handler: Handler<EventDecl.StateUpdateBefore<M, K>>) {
        super.unbindHandler(handler);
        this.parent.updateState(this.key);
    }
}
