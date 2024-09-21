import type { App } from "../app";
import type { Model } from "../models";
import { IBase, IReflect } from "../type";
import type { IModel } from "../type/model";
import type { Emitter } from "./emitter";

/** 事件处理器 */
export class Handler<E = any> {
    private readonly $app: App;

    public readonly model: Model;
    public readonly handlerKey: string;

    private readonly $emitterBundleList: [string, string][];
    private readonly $emitterList: Emitter<E>[];

    public handleEvent(event: E) {  
        this.model.$handlerCallerDict[this.handlerKey].call(this.model, event);
    }

    constructor(
        emitterBundleList: [string, string][],
        handlerKey: string,
        model: Model
    ) {
        this.$app = model.app;
        this.model = model;
        this.handlerKey = handlerKey;
        this.$emitterBundleList = emitterBundleList;
        this.$emitterList = [];
    }

    /** 添加事件处理器 */
    public $addEmitter(eventEmitter: Emitter<E>) {
        this.$emitterList.push(eventEmitter);
    }

    /** 移除事件处理器 */
    public $removeEmitter(eventEmitter: Emitter<E>) {
        const index = this.$emitterList.indexOf(eventEmitter);
        if (index >= 0) {
            this.$emitterList.splice(index, 1);
        }
    }

    /** 挂载到根节点，构建依赖关系 */
    public $mountRoot() {
        this.$emitterBundleList.forEach(([ modelId, emitterKey ]) => {
            const model = this.$app.referenceService.referDict[modelId];
            if (model) {
                model.emitterDict[emitterKey].bindHandler(this);
            }
        });
    }

    /** 构建序列化参数 */
    public $makeBundle(): [string, string][] {
        const bundle: [string, string][] = [];
        for (const emitter of this.$emitterList) {
            if (emitter.model && emitter.emitterKey) {
                bundle.push([
                    emitter.model.id,
                    emitter.emitterKey
                ]);
            }
        }
        return bundle;
    }

    /** 从根节点卸载，解除依赖关系  */
    public $unmountRoot() {
        this.$emitterList.forEach(item => {
            item.unbindHandler(this);
        });
    }
}

export function handlerDictProxy<M extends IBase.Dict>(
    config: IModel.HandlerBundleDict<M> | undefined,
    model: Model
): {
    proxy: IModel.HandlerDict<M>,
    hooks: IModel.EventHookDict
} {
    const handlerDict = {} as IModel.HandlerDict<M>;
    if (config) {
        Object.keys(config).forEach((
            key: IReflect.Key<IModel.HandlerDict<M>>
        ) => {
            const handler = new Handler(config[key] || [], key, model);
            handlerDict[key] = handler;
        });
    }

    const hooks: IModel.EventHookDict = {
        mountRoot: () => {
            for (const key in handlerDict) {
                handlerDict[key].$mountRoot();
            }
        },
        unmountRoot: () => {
            for (const key in handlerDict) {
                handlerDict[key].$unmountRoot();
            }
        },
        makeBundle: () => {
            const bundle = {} as any;
            for (const key in handlerDict) {
                bundle[key] = handlerDict[key].$makeBundle();
            }
            return bundle;
        }
    };
    
    const proxy = new Proxy(handlerDict, {
        get: (origin, key: IReflect.Key<IModel.HandlerDict<M>>) => {
            if (!origin[key]) {
                origin[key] = new Handler([], key, model);
            }
            return origin[key];
        },
        set: () => false
    });

    return {
        proxy,
        hooks
    };
}
