import type { App } from "../app";
import { IBase } from "../type";
import { ConnectorDecl } from "../type/connector";
import { Emitter, SafeEmitter } from "./emitter";
import { Entity } from "./entity";

/** 触发器代理 */
export class EmitterProxy<
    D extends IBase.Dict, 
    P = any
> extends Entity {
    public readonly emitterDict: ConnectorDecl.EmitterDict<D, P>;
    /** 防止成员泄露 */
    public readonly safeEmitterDict = {} as ConnectorDecl.SafeEmitterDict<D, P>;

    constructor(
        config: ConnectorDecl.ConfigDict<D> | undefined,
        parent: P,
        app: App
    ) {
        super(app);
        const origin = {} as ConnectorDecl.EmitterDict<D, P>;
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

    public serialize(): ConnectorDecl.ChunkDict<D> {
        const result = {} as ConnectorDecl.ChunkDict<D>;
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
