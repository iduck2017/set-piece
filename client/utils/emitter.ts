import type { App } from "../app";
import { CursorType } from "../type/cursor";
import { CurSor } from "./cursor";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<
    E = any, 
    P = any
> extends CurSor<Handler<E>, P> {
    constructor(
        config: CursorType.Config,
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

    /** 事件触发函数 */
    public emitEvent(event: E) {
        this.cursorList.forEach(item => {
            item.handleEvent(event);
        });
    }

    /** 绑定事件处理器 */
    public bindHandler(handler: Handler<E>) {
        this.addCursor(handler);
        handler.addCursor(this);
    }

    /** 解绑事件处理器 */
    public unbindHandler(handler: Handler<E>) {
        this.removeCursor(handler);
        handler.removeCursor(this);
    }
}

