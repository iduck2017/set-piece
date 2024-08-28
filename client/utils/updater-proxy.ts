import type { App } from "../app";
import type { Model } from "../models";
import { LinkerType } from "../type/linker";
import { ModelDef } from "../type/definition";
import { ModelType } from "../type/model";
import { ModelTmpl } from "../type/template";
import { Updater } from "./updater";

/** 状态修饰器代理 */
export class UpdaterProxy<
    M extends ModelTmpl
> {
    public readonly updaterDict: ModelType.UpdaterDict<M>;
    public readonly binderIntf = 
        {} as LinkerType.BinderIntf<ModelType.UpdaterEventDict<M>>;
    public readonly unbinderIntf = 
        {} as LinkerType.UnbinderIntf<ModelType.UpdaterEventDict<M>>;

    constructor(
        config: LinkerType.ConfigDict<M[ModelDef.State]>,
        parent: Model<M>,
        app: App
    ) {
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
        this.updaterDict = new Proxy(origin, {
            get: (target, key: keyof M[ModelDef.State]) => {
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
        });


        /** 触发器绑定接口集合 */
        this.binderIntf = new Proxy(
            this.binderIntf, {
                get: (target, key) => {
                    return this.updaterDict[key].bindHandler.bind(
                        this.updaterDict[key]
                    );
                },
                set: () => false
            }
        );

        /** 触发器解绑接口集合 */
        this.unbinderIntf = new Proxy(
            this.unbinderIntf, {
                get: (target, key) => {
                    return this.updaterDict[key].unbindHandler.bind(
                        this.updaterDict[key]
                    );
                },
                set: () => false
            }
        );
    }

    public serialize() {
        const result = {} as LinkerType.ChunkDict<M[ModelDef.State]>;
        for (const key in this.updaterDict) {
            result[key] = this.updaterDict[key].serialize();
        }
        return result;
    }

    public destroy() {
        Object.values(this.updaterDict).forEach(item => {
            item.destroy();
        });
    }
}
