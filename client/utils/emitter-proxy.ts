import type { App } from "../app";
import { IBase } from "../type";
import { IConnector } from "../type/connector";
import { Emitter } from "./emitter";
import { Entity } from "./entity";

/** 触发器代理 */
export class EmitterProxy<
    D extends IBase.Dict, 
    P = any
> extends Entity {
    public readonly emitterDict: IConnector.EmitterDict<D, P>;
    public readonly emitterBinderDict = {} as IConnector.BinderDict<D>;
    public readonly emitterUnbinderDict = {} as IConnector.BinderDict<D>;

    constructor(
        config: IConnector.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        super(app);
        /** 触发器集合 */
        const origin = {} as IConnector.EmitterDict<D, P>;
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
        this.emitterBinderDict = new Proxy(
            this.emitterBinderDict, {
                get: (target, key) => {
                    return this.emitterDict[key].bindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );

        /** 触发器解绑接口集合 */
        this.emitterUnbinderDict = new Proxy(
            this.emitterUnbinderDict, {
                get: (target, key) => {
                    return this.emitterDict[key].unbindHandler.bind(
                        this.emitterDict[key]
                    );
                },
                set: () => false
            }
        );
    }

    public serialize(): IConnector.ChunkDict<D> {
        const result = {} as IConnector.ChunkDict<D>;
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
