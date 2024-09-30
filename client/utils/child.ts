import type { Model } from "../models";
import { IReflect } from "../type";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";

export class ChildProxy<M extends IModel.Define> {
    // 从属对象列表
    public readonly $list: IModel.ChildList<M>;
    public readonly $dict: IModel.ChildDict<M>;

    private $initChildList(
        config: IModel.ChildConfigList<M>,
        model: Model
    ): IModel.ChildList<M> {
        const origin: IModel.ChildList<M> = [];
        for (const childConfig of config) {
            origin.push(window.$app.factory.unserialize(childConfig));
        }

        return new Proxy(origin, {
            set: (target, key, value) => {
                target[key as IReflect.Key<IModel.ChildList<M>>] = value;
                if (
                    key !== Symbol.iterator && 
                    !isNaN(Number(key))
                ) {
                    const child: Model = value;
                    child.$bindParent(model);
                    if (child.status === ModelStatus.MOUNTED) {
                        child.$bootDriver();
                    }
                    model.$setChildren();
                }
                return true;
            },
            deleteProperty: (target, key: any) => {
                const value = target[key];
                if (value.status === ModelStatus.MOUNTED) {
                    value.$unbootDriver();
                }
                value.$unbindParent();

                delete target[key];
                target.length --;
                
                model.$setChildren();
                return true;
            }
        });
    }

    private $initChildDict(
        config: IModel.ChildConfigDict<M>,
        model: Model
    ): IModel.ChildDict<M> {
        const origin = {} as IModel.ChildDict<M>;
        Object.keys(config).forEach((
            key: IReflect.Key<IModel.ChildDict<M>>
        ) => {
            origin[key] = window.$app.factory.unserialize(config[key]);
        });

        return new Proxy(origin, {
            set: (target, key, value) => {
                target[key as IReflect.Key<IModel.ChildDict<M>>] = value as any;   
                value.$bindParent(model);
                if (value.status === ModelStatus.MOUNTED) {
                    value.$bootDriver();
                }
                model.$setChildren();
                return true;
            },
            deleteProperty: (target, key: any) => {
                const value = target[key];
                if (value.status === ModelStatus.MOUNTED) {
                    value.$unbootDriver();
                }
                value.$unbindParent();
                delete target[key];
                model.$setChildren();
                return true;
            }
        });
    }

    constructor(
        config: IModel.BaseConfig<M>,
        model: Model
    ) {
        this.$list = this.$initChildList(config.childBundleList, model);
        this.$dict = this.$initChildDict(config.childBundleDict, model);
    }

    // 挂载到根节点
    mountRoot() {
        for (const child of this.$list) {
            child.$mountRoot();
        }
        for (const key in this.$dict) {
            this.$dict[key].$mountRoot();
        }
    }

    // 从根节点卸载
    unmountRoot() {
        for (const child of this.$list) {
            child.$unmountRoot();
        }
        for (const key in this.$dict) {
            this.$dict[key].$unmountRoot();
        }
    }

    // 绑定到父节点
    bindParent(parent: Model) {
        for (const child of this.$list) {
            child.$bindParent(parent);
        }
        for (const key in this.$dict) {
            this.$dict[key].$bindParent(parent);
        }
    }

    // 从父节点解绑
    unbindParent() {
        for (const child of this.$list) {
            child.$unbindParent();
        }
        for (const key in this.$dict) {
            this.$dict[key].$unbindParent();
        }
    }

    // 启用功能
    activateFeat() {
        for (const child of this.$list) {
            child.$bootDriver();
        }
        for (const key in this.$dict) {
            this.$dict[key].$bootDriver();
        }
    }

    // 禁用功能
    deactivateFeat() {
        for (const child of this.$list) {
            child.$unbootDriver();
        }
        for (const key in this.$dict) {
            this.$dict[key].$unbootDriver();
        }
    }
    
}
