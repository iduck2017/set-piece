import { IBase, IReflect } from "../type";
import type { IModel } from "../type/model";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<E = any> {
    public readonly id: string;

    /** 事件处理器队列 */
    private readonly $handlerIdList: string[];
    private readonly $handlerList: Handler<E>[];

    constructor(config?: string[]) {
        const [ id, ...handlerIdList ] = config || [];
        this.id = id || window.$app.referenceService.getUniqId();
        this.$handlerIdList = handlerIdList;
        this.$handlerList = [];
    }

    /** 初始化事件处理器队列 */
    public mountRoot() {
        window.$app.referenceService.emitterDict[this.id] = this;
        for (const handlerId of this.$handlerIdList) {
            const handler = window.$app.referenceService.handlerDict[handlerId];
            if (handler) {
                this.bindHandler(handler);
            }
        }
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
    public makeBundle(): string[] {
        const bundle: string[] = [];
        for (const handler of this.$handlerList) {
            bundle.push(handler.id);
        }
        return bundle;
    }

    /** 从根节点卸载，解除依赖关系  */
    public unmountRoot() {
        this.$handlerList.forEach(item => {
            this.unbindHandler(item);
        });
        delete window.$app.referenceService.emitterDict[this.id];
    }
}


export class EmitterDictProxy<E extends IBase.Dict> {
    public readonly emitterDict: IModel.EmitterDict<E>;
    private readonly $emitterBundleDict?: IModel.EmitterBundleDict<E>;

    constructor(config?: IModel.EmitterBundleDict<E>) {
        this.$emitterBundleDict = config;
        const emitterDict = {} as IModel.EmitterDict<E>;
        for (const key in config) {
            emitterDict[
                key as IReflect.Key<IModel.EmitterDict<E>>
            ] = new Emitter(config[key]);
        }
        this.emitterDict= new Proxy(emitterDict, {
            get: (origin, key: IReflect.Key<IModel.HandlerDict<E>>) => {
                if (!origin[key]) {
                    origin[key] = new Emitter();
                }
                return origin[key];
            },
            set: () => false
        });
    }

    public mountRoot() {
        for (const key in this.$emitterBundleDict) {
            const emitter = this.emitterDict[key];
            emitter.mountRoot();
        }
    }

    public unmountRoot() {
        for (const key in this.emitterDict) {
            this.emitterDict[key].unmountRoot();
        }
    }

    public makeBundle() {
        const bundle = {} as any;
        for (const key in this.emitterDict) {
            bundle[key] = this.emitterDict[key].makeBundle();
        }
        return bundle;
    }
}
