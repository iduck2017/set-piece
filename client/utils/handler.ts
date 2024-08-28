import type { App } from "../app";
import { CursorType } from "../type/cursor";
import { CurSor } from "./cursor";
import type { Emitter } from "./emitter";

/** 事件接收器 */
export class Handler<
    E = any, 
    P = any
> extends CurSor<Emitter<E>, P> {
    public readonly handleEvent: CursorType.HandleEventFunc<E>;
    
    constructor(
        callback: CursorType.HandleEventFunc<E>,
        config: CursorType.Config,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent, 
            app
        );
        this.handleEvent = callback;
        config.list?.forEach(id => {
            const emitter = app.referService.emitterReferManager.referDict[id];
            if (emitter) {
                emitter.bindHandler(this);
            }
        });
    }
}
