import type { App } from "../app";
import { LinkerType } from "../type/linker";
import { Linker } from "./linker";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<
    E = any, 
    P = any
> extends Linker<Handler<E>, P> {
    constructor(
        config: LinkerType.Config,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent, 
            app
        );
        config.list?.forEach(id => {
            const handler = app.referService.handlerReferManager.referDict[id];
            if (handler) {
                this.bindHandler(handler);
            }
        });
    }

    /** 事件触发函数 */
    public emitEvent(event: E) {
        this.linkerList.forEach(item => {
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
    
    public destroy() { 
        this.linkerList.forEach(item => {
            this.unbindHandler(item);
        }); 
    }
}

