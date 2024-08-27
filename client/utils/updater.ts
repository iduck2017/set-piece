import type { App } from "../app";
import type { Model } from "../models";
import { ModelTmpl } from "../type/template";
import { Event, EventReflect } from "../type/event";
import { Emitter } from "./emitter";
import type { Handler } from "./handler";
import { ModelDef } from "../type/definition";
import type { ModelReflect } from "../type/model";

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


export class UpdaterProxy<M extends ModelTmpl> {
    public readonly dict: ModelReflect.UpdaterDict<M>;
    public readonly bindIntf: EventReflect.BindIntf<ModelReflect.UpdaterEventDict<M>>;
    public readonly unbindIntf: EventReflect.BindIntf<ModelReflect.UpdaterEventDict<M>>;

    constructor(
        config: EventReflect.ChunkDict<M>,
        parent: Model<M>,
        app: App
    ) {
        const origin = Object.keys(config).reduce((result, key) => ({
            ...result,
            [key]: new Updater(
                key,
                config[key as keyof M[ModelDef.State]] || [], 
                parent,
                app
            )
        }),  {}) as ModelReflect.UpdaterDict<M>;
        
        this.dict = new Proxy(origin, {
            get: (target, key: keyof M[ModelDef.State]) => {
                if (!target[key]) {
                    target[key] = new Updater(key, [], parent, app);
                }
                return target[key];
            },
            set: () => false
        });

        this.bindIntf = new Proxy({}, {
            get: (target, key) => this.dict[key].bindHandler.bind(this.dict[key]),
            set: () => false
        }) as EventReflect.BindIntf<ModelReflect.UpdaterEventDict<M>>;

        this.unbindIntf = new Proxy({}, {
            get: (target, key) => this.dict[key].unbindHandler.bind(this.dict[key]),
            set: () => false
        }) as EventReflect.BindIntf<ModelReflect.UpdaterEventDict<M>>;
    }

    public serialize() {
        return Object.keys(this.dict).reduce((dict, key) => ({
            ...dict,
            [key]: this.dict[key].serialize()   
        }), {});
    }

    public destroy() {
        Object.values(this.dict).forEach(item => item.destroy());
    }
}
