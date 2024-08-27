import type { App } from "../app";
import { Base } from "../type";
import type { EventReflect } from "../type/event";
import { CurSor, CursorConfig } from "./cursor";
import type { Handler } from "./handler";

/** 触发器 */
export class Emitter<
    E = any, 
    P = any
> extends CurSor<Handler<E>, P> {
    constructor(
        config: CursorConfig,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent, 
            app
        );
        config.cursorIdList?.forEach(id => {
            const handler = app.referService.handlerReferManager.referDict[id];
            if (handler) {
                this.bindHandler(handler);
            }
        });
    }

    /** 触发事件 */
    public emitEvent(event: E) {
        this.cursorList.forEach(item => {
            item.handleEvent(event);
        });
    }

    public bindHandler(handler: Handler<E>) {
        this.addCursor(handler);
        handler.addCursor(this);
    }

    public unbindHandler(handler: Handler<E>) {
        this.removeCursor(handler);
        handler.removeCursor(this);
    }
}

export class EmitterProxy<D extends Base.Dict, P = any> {
    public readonly dict: EventReflect.EmitterDict<D>;
    public readonly bindIntf: EventReflect.BindIntf<D>;
    public readonly unbindIntf: EventReflect.BindIntf<D>;

    constructor(
        config: EventReflect.ChunkDict<D>,
        parent: P,
        app: App
    ) {
        const origin = Object.keys(config).reduce((result, key) => ({
            ...result,
            [key]: new Emitter(
                config[key] || {}, 
                parent,
                app
            )
        }),  {}) as EventReflect.EmitterDict<D>;
        
        this.dict = new Proxy(origin, {
            get: (target, key: keyof D) => {
                if (!target[key]) {
                    target[key] = new Emitter({}, parent, app);
                }
                return target[key];
            },
            set: () => false
        });

        this.bindIntf = new Proxy({}, {
            get: (target, key) => this.dict[key].bindHandler.bind(this.dict[key]),
            set: () => false
        }) as EventReflect.BindIntf<D>;

        this.unbindIntf = new Proxy({}, {
            get: (target, key) => this.dict[key].unbindHandler.bind(this.dict[key]),
            set: () => false
        }) as EventReflect.BindIntf<D>;
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