import type { App } from "../app";
import type { Model } from "../models";
import { IBase, IReflect } from "../type";
import type { IModel } from "../type/model";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<E = any> {
    private readonly $id: [string, string];
    public get id() { return this.$id; }

    /** 事件处理器队列 */
    private readonly $handlerList: Handler<E>[];

    constructor( 
        id: [string, string]
    ) {
        this.$id = id;
        this.$handlerList = [];
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
    public $makeBundle(): [string, string][] {
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

    /** 从根节点卸载，解除依赖关系  */
    public unbindHandlerList() {
        this.$handlerList.forEach(item => {
            this.unbindHandler(item);
        });
    }
}


export class EmitterDictProxy<E extends IBase.Dict> {
    public readonly emitterDict: IModel.EmitterDict<E>;
    private readonly $emitterBundleDict?: IModel.EmitterBundleDict<E>;

    public readonly app: App;

    constructor(
        config: IModel.EmitterBundleDict<E> | undefined,
        model: Model
    ) {
        this.app = model.app;
        this.$emitterBundleDict = config;
        const emitterDict = {} as IModel.EmitterDict<E>;
        this.emitterDict= new Proxy(emitterDict, {
            get: (origin, key: IReflect.Key<IModel.HandlerDict<E>>) => {
                if (!origin[key]) {
                    origin[key] = new Emitter([ model.id, key ]);
                }
                return origin[key];
            },
            set: () => false
        });
    }

    mountRoot() {
        for (const key in this.$emitterBundleDict) {
            const emitter = this.emitterDict[key];
            const handlerBundleList = this.$emitterBundleDict[key];
            if (handlerBundleList) {
                handlerBundleList.forEach((bundle) => {
                    const [ modelId, handlerKey ] = bundle;
                    const model = this.app.referenceService.referDict[modelId];
                    if (model) {
                        emitter.bindHandler(model.$handlerDict[handlerKey]);
                    }
                });
            }
        }
    }

    unmountRoot() {
        for (const key in this.emitterDict) {
            this.emitterDict[key].unbindHandlerList();
        }
    }

    makeBundle() {
        const bundle = {} as any;
        for (const key in this.emitterDict) {
            bundle[key] = this.emitterDict[key].$makeBundle();
        }
        return bundle;
    }
}
