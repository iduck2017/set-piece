import type { App } from "../app";
import type { Model } from "../models";
import { ModelTmpl } from "../type/template";
import { Event } from "../type/event";
import { Emitter } from "./emitter";
import type { Handler } from "./handler";
import type { ModelReflect } from "../type/model";

export class Updater<
    M extends ModelTmpl,
    K extends keyof ModelReflect.State<M>,
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

    public bind(handler: Handler<Event.StateUpdateBefore<M, K>>) {
        super.bind(handler);
        this.parent.updateState(this.key);
    }

    public unbind(handler: Handler<Event.StateUpdateBefore<M, K>>) {
        super.unbind(handler);
        this.parent.updateState(this.key);
    }
}
