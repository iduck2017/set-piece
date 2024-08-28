import type { App } from "../app";
import { Base } from "../type";
import { LinkerType } from "../type/linker";
import { Emitter } from "./emitter";

/** 触发器代理 */
export class EmitterProxy<
    D extends Base.Dict, 
    P = any
> {
    public readonly emitterDict: LinkerType.EmitterDict<D, P>;
    public readonly binderIntf = {} as LinkerType.BinderIntf<D>;
    public readonly unbinderIntf = {} as LinkerType.UnbinderIntf<D>;

    constructor(
        config: LinkerType.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        /** 触发器集合 */
        const origin = {} as LinkerType.EmitterDict<D, P>;
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
        this.binderIntf = new Proxy(
            this.binderIntf, {
                get: (target, key) => {
                    return this.emitterDict[key].bindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );

        /** 触发器解绑接口集合 */
        this.unbinderIntf = new Proxy(
            this.unbinderIntf, {
                get: (target, key) => {
                    return this.emitterDict[key].unbindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );
    }

    public serialize(): LinkerType.ChunkDict<D> {
        const result = {} as LinkerType.ChunkDict<D>;
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
