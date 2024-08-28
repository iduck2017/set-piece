import type { App } from "../app";
import { Base } from "../type";
import { LinkerType } from "../type/linker";
import { Handler } from "./handler";

/** 接收器代理 */
export class HandlerProxy<
    D extends Base.Dict, 
    P = any
> {
    public readonly handlerDict: LinkerType.HandlerDict<D, P>;

    constructor(
        callback: LinkerType.HandlerIntf<D>,
        config: LinkerType.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        /** 触发器集合 */
        const origin = {} as LinkerType.HandlerDict<D, P>;
        for (const key in callback) {
            origin[key] = new Handler(
                callback[key], 
                config[key] || {}, 
                parent,
                app
            );  
        }
        this.handlerDict = new Proxy(origin, {
            set: () => false
        });
    }

    public serialize(): LinkerType.ChunkDict<D> {
        const result = {} as LinkerType.ChunkDict<D>;
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
