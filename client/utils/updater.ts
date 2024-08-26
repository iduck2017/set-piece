import type { App } from "../app";
import type { Model } from "../models";
import { ModelTmpl } from "../type/template";
import { Event } from "../type/event";
import { Emitter } from "./emitter";
import type { Handler } from "./handler";
import { ModelDef } from "../type/definition";

export class Updater<
    M extends ModelTmpl,
    K extends keyof M[ModelDef.State],
> extends Emitter<
    Event.StateUpdateBefore<M, K>, 
    Model<M>
> {
    public readonly key: K;

    constructor(
        key: K,
        config: string[],
        parent: Model<M>,
        app: App
    ) {
        super(config, parent, app);
        this.key = key;
    }

    public bindHandler(handler: Handler<Event.StateUpdateBefore<M, K>>) {
        super.bindHandler(handler);
        this.parent.updateState(this.key);
    }

    public unbindHandler(handler: Handler<Event.StateUpdateBefore<M, K>>) {
        super.unbindHandler(handler);
        this.parent.updateState(this.key);
    }
}
