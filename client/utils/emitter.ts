import type { App } from "../app";
import type { Model } from "../models";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<E = any> {
    private readonly $app: App;

    public readonly model: Model;
    public readonly emitterKey: string;

    /** 待生成事件处理器队列 */
    private readonly $handlerBundleList: [string, string][];
    /** 事件处理器队列 */
    private readonly $handlerList: Handler<E>[];

    constructor( 
        handlerBundleList: [string, string][],
        emitterKey: string,
        model: Model,
        app: App
    ) {
        this.$app = app;
        this.model = model;
        this.emitterKey = emitterKey;
        this.$handlerList = [];
        this.$handlerBundleList = handlerBundleList;
    }

    /** 添加事件处理器 */
    private $addHandler(eventHandler: Handler<E>) {
        this.$handlerList.push(eventHandler);
    }

    /** 移除事件处理器 */
    private $removeHandler(eventHandler: Handler<E>) {
        const index = this.$handlerList.indexOf(eventHandler);
        if (index >= 0) {
            this.$handlerList.splice(index, 1);
        }
    }

    /** 绑定事件处理器 */
    public bindHandler(handler: Handler<E>) {
        handler.$addEmitter(this);
        this.$addHandler(handler);
    }

    /** 解除事件处理器绑定 */
    public unbindHandler(handler: Handler<E>) {
        this.$removeHandler(handler);
        handler.$removeEmitter(this);
    }

    /** 触发事件 */
    public emitEvent(event: E) {
        for (const handler of this.$handlerList) {
            handler.handleEvent(event);
        }
    }

    /** 构建序列化参数 */
    public makeBundle(): [string, string][] {
        const bundle: [string, string][] = [];
        for (const handler of this.$handlerList) {
            if (handler.model && handler.handlerKey) {
                bundle.push([
                    handler.model.id,
                    handler.handlerKey
                ]);
            }
        }
        return bundle;
    }

    /** 挂载到根节点，构建依赖关系 */
    public mountRoot() {
        this.$handlerBundleList.forEach(([ modelId, handlerKey ]) => {
            const model = this.$app.referenceService.referDict[modelId];
            if (model) {
                this.bindHandler(model.$handlerDict[handlerKey]);
            }
        });
    }

    /** 从根节点卸载，解除依赖关系  */
    public unmountRoot() {
        this.$handlerList.forEach(item => {
            this.unbindHandler(item);
        });
    }
}

// export function emitterProxy<M extends IBase.Dict>(
//     config: IModel.EmitterBundleDict<M>,
//     model: M,
//     app: App
// ): {
//     proxy: any,
//     hooks: IModel.ModelHookDict
// } {
//     const childDict = {} as IModel.ChildDict<M>;
//     for (const key in config) {
//         childDict[key] = app.factoryService.unserialize(config[key]);
//     }

//     const hooks: IModel.ModelHookDict = {
//         $bootDriver: () => {
//             for (const key in childDict) {
//                 childDict[key].$bootDriver();
//             }
//         },
//         $unbootDriver: () => {
//             for (const key in childDict) {
//                 childDict[key].$unbootDriver();
//             }
//         },
//         $mountRoot: () => {
//             for (const key in childDict) {
//                 childDict[key].$mountRoot();
//             }
//         },
//         $unmountRoot: () => {
//             for (const key in childDict) {
//                 childDict[key].$unmountRoot();
//             }
//         },
//         $unbindParent: () => {
//             for (const key in childDict) {
//                 childDict[key].$unbindParent();
//             }
//         },
//         $bindParent: (parent: Model) => {
//             for (const key in childDict) {
//                 childDict[key].$bindParent(parent);
//             }
//         },
//         $makeBundle: () => {
//             const bundle = {} as any;
//             for (const key in childDict) {
//                 bundle[key] = childDict[key].makeBundle();
//             }
//             return bundle;
//         }
//     };

//     const proxy = new Proxy(childDict, {
//         set: (
//             target, 
//             key: any, 
//             value: Model
//         ) => {
//             target[key as IReflect.Key<IModel.ChildDict<M>>] = value as any;   
//             value.$bindParent(model);
//             if (value.status === ModelStatus.MOUNTED) {
//                 value.$bootDriver();
//             }
//             model.$setChildren();
//             return true;
//         },
//         deleteProperty: (target, key: any) => {
//             const value = target[key];
//             if (value.status === ModelStatus.MOUNTED) {
//                 value.$unbootDriver();
//             }
//             value.$unbindParent();
//             delete target[key];
//             model.$setChildren();
//             return true;
//         }
//     });

//     return {
//         proxy,
//         hooks
//     };
// }
