import type { App } from "../app";
import type { Model } from "../models";
import { BaseModelDef } from "../type/definition";
import { ConnectorType } from "../type/connector";
import { ModelType } from "../type/model";
import { Entity } from "./entity";
import { Updater } from "./updater";
import { SafeEmitter } from "./emitter";
import { ModelKey } from "../type/registry";

/** 状态修饰器代理 */
export class UpdaterProxy<
    M extends BaseModelDef
> extends Entity {
    public readonly updaterDict: ModelType.UpdaterDict<M>;
    public readonly safeUpdaterDict = {} as ModelType.SafeUpdaterDict<M>;

    constructor(
        config: ConnectorType.ConfigDict<M[ModelKey.State]> | undefined,
        parent: Model<M>,
        app: App
    ) {
        super(app);
        /** 状态修饰器集合 */
        const origin = {} as ModelType.UpdaterDict<M>;
        for (const key in config) {
            origin[key] = new Updater(
                { 
                    key,
                    ...config[key]
                }, 
                parent,
                app
            );
        }

        this.updaterDict = new Proxy(
            origin, {
                get: (target, key: keyof M[ModelKey.State]) => {
                    if (!target[key]) {
                        target[key] = new Updater(
                            { key }, 
                            parent,
                            app
                        );
                    }
                    return target[key];
                },
                set: () => false
            }
        );
        this.safeUpdaterDict = new Proxy(
            this.safeUpdaterDict, {
                get: (target, key: keyof M[ModelKey.State]) => {
                    if (!target[key]) {
                        target[key] = new SafeEmitter(
                            this.updaterDict[key]
                        );
                    }
                    return target[key];
                }
            }
        );
    }

    /** 序列化 */
    public serialize() {
        const result = {} as ConnectorType.ChunkDict<M[ModelKey.State]>;
        for (const key in this.updaterDict) {
            result[key] = this.updaterDict[key].serialize();
        }
        return result;
    }

    /** 析构 */
    public destroy() {
        Object.values(this.updaterDict).forEach(item => {
            item.destroy();
        });
    }
}
