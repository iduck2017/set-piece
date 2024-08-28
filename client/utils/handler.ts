import type { App } from "../app";
import { LinkerType } from "../type/linker";
import { Linker } from "./linker";
import type { Emitter } from "./emitter";

/** 事件接收器 */
export class Handler<
    E = any, 
    P = any
> extends Linker<Emitter<E>, P> {
    public handleEvent: LinkerType.HandlerFunc<E>;

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
        this.handleEvent = () => {};
        config.list?.forEach(id => {
            const emitter = app.referService.emitterReferManager.referDict[id];
            if (emitter) {
                emitter.bindHandler(this);
            }
        });
    }

    public destroy() { 
        this.linkerList.forEach(item => {
            item.unbindHandler(this);
        }); 
    }
}
