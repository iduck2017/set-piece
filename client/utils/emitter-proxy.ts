import type { App } from "../app";
import { IBase } from "../type";
import { IConnector } from "../type/connector";
import { Emitter, SafeEmitter } from "./emitter";
import { Entity } from "./entity";

/** 触发器代理 */
export class EmitterProxy<
    D extends IBase.Dict, 
    P = any
> extends Entity {
    public readonly emitterDict: IConnector.EmitterDict<D, P>;
    /** 防止成员泄露 */
    public readonly safeEmitterDict = {} as IConnector.SafeEmitterDict<D, P>;

    constructor(
        config: IConnector.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        super(app);
        const origin = {} as IConnector.EmitterDict<D, P>;
        for (const key in config) {
            origin[key] = new Emitter(
                config[key] || {}, 
                parent,
                app
            );  
        }

        this.emitterDict = new Proxy(
            origin, {
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
            }
        );
        this.safeEmitterDict = new Proxy(
            this.safeEmitterDict, {
                get: (target, key: keyof D) => {
                    if (!target[key]) {
                        target[key] = new SafeEmitter(
                            this.emitterDict[key]
                        );
                    }
                    return target[key];
                }
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
