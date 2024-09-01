import type { App } from "../app";
import type { Model } from "../models";
import { EventType } from "../type/event";
import { Emitter } from "./emitter";
import type { Handler } from "./handler";
import type { ModelType } from "../type/model";
import { ModelKey } from "../type/registry";
import { BaseModelDef } from "../type/definition";

/** 状态修饰器 */
export class Updater<
    M extends BaseModelDef,
    K extends keyof M[ModelKey.State],
> extends Emitter<
    EventType.StateUpdateBefore<M, K>, 
    Model<M>
> {
    /** 状态键值 */
    public readonly key: K;

    constructor(
        config: ModelType.UpdaterConfig<K>,
        parent: Model<M>,
        app: App
    ) {
        super(config, parent, app);
        this.key = config.key;
    }

    public bindHandler(handler: Handler<EventType.StateUpdateBefore<M, K>>) {
        super.bindHandler(handler);
        this.parent.updateState(this.key);
    }

    public unbindHandler(handler: Handler<EventType.StateUpdateBefore<M, K>>) {
        super.unbindHandler(handler);
        this.parent.updateState(this.key);
    }
}
