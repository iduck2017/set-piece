import type { App } from "../app";
import { Base } from "../type";
import { CursorType } from "../type/cursor";
import { Handler } from "./handler";

/** 接收器代理 */
export class HandlerProxy<
    D extends Base.Dict, 
    P = any
> {
    public readonly handlerDict: CursorType.HandlerDict<D, P>;

    constructor(
        callbackIntf: CursorType.HandleEventIntf<D>,
        config: CursorType.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        /** 触发器集合 */
        const origin = {} as CursorType.HandlerDict<D, P>;
        for (const key in callbackIntf) {
            origin[key] = new Handler(
                callbackIntf[key], 
                config[key] || {}, 
                parent,
                app
            );  
        }
        this.handlerDict = new Proxy(origin, {
            set: () => false
        });
    }

    public serialize(): CursorType.ChunkDict<D> {
        const result = {} as CursorType.ChunkDict<D>;
        for (const key in this.handlerDict) {
            result[key] = this.handlerDict[key].serialize();
        }
        return result;
    }

    public destroy() {
        Object.values(this.handlerDict).forEach(item => {
            item.destroy();
        });
    }
}
