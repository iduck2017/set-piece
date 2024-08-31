import type { App } from "../app";
import type { Model } from "../models";
import { IModelDef, ModelKey } from "../type/definition";
import { IConnector } from "../type/connector";
import { IModel } from "../type/model";
import { Entity } from "./entity";
import { Updater } from "./updater";

/** 状态修饰器代理 */
export class UpdaterProxy<
    M extends IModelDef.Default
> extends Entity {
    public readonly updaterDict: IModel.UpdaterDict<M>;
    public readonly binderDict = {} as IConnector.BinderDict<IModel.UpdaterEventDict<M>>;
    public readonly unbinderDict = {} as IConnector.BinderDict<IModel.UpdaterEventDict<M>>;

    constructor(
        config: IConnector.ConfigDict<M[ModelKey.State]>,
        parent: Model<M>,
        app: App
    ) {
        super(app);
        /** 状态修饰器集合 */
        const origin = {} as IModel.UpdaterDict<M>;
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
        });


        /** 触发器绑定接口集合 */
        this.binderDict = new Proxy(
            this.binderDict, {
                get: (target, key) => {
                    return this.updaterDict[key].bindHandler.bind(
                        this.updaterDict[key]
                    );
                },
                set: () => false
            }
        );

        /** 触发器解绑接口集合 */
        this.unbinderDict = new Proxy(
            this.unbinderDict, {
                get: (target, key) => {
                    return this.updaterDict[key].unbindHandler.bind(
                        this.updaterDict[key]
                    );
                },
                set: () => false
            }
        );
    }

    /** 序列化 */
    public serialize() {
        const result = {} as IConnector.ChunkDict<M[ModelKey.State]>;
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
