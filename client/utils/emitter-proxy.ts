import type { App } from "../app";
import { Base } from "../type";
import { CursorType } from "../type/cursor";
import { Emitter } from "./emitter";

/** 触发器代理 */
export class EmitterProxy<
    D extends Base.Dict, 
    P = any
> {
    public readonly emitterDict: CursorType.EmitterDict<D, P>;
    public readonly bindHandlerIntf = {} as CursorType.BindHandlerIntf<D>;
    public readonly unbindHandlerIntf = {} as CursorType.UnbindHandlerIntf<D>;

    constructor(
        config: CursorType.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        /** 触发器集合 */
        const origin = {} as CursorType.EmitterDict<D, P>;
        for (const key in config) {
            origin[key] = new Emitter(
                config[key] || {}, 
                parent,
                app
            );  
        }
        this.emitterDict = new Proxy(origin, {
            get: (target, key: keyof D) => {
                if (!target[key]) {
                    target[key] = new Emitter(
                        {}, 
                        parent,
                        app
                    );
                }
                return target[key];
            },
            set: () => false
        });

        /** 触发器绑定接口集合 */
        this.bindHandlerIntf = new Proxy(
            this.bindHandlerIntf, {
                get: (target, key) => {
                    return this.emitterDict[key].bindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );

        /** 触发器解绑接口集合 */
        this.unbindHandlerIntf = new Proxy(
            this.unbindHandlerIntf, {
                get: (target, key) => {
                    return this.emitterDict[key].unbindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );
    }

    public serialize(): CursorType.ChunkDict<D> {
        const result = {} as CursorType.ChunkDict<D>;
        for (const key in this.emitterDict) {
            result[key] = this.emitterDict[key].serialize();
        }
        return result;
    }

    public destroy() {
        Object.values(this.emitterDict).forEach(item => {
            item.destroy();
        });
    }
}
