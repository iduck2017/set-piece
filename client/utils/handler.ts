import { IBase, IReflect } from "../type";
import type { IModel } from "../type/model";
import type { Emitter } from "./emitter";

/** 事件处理器 */
export class Handler<E = any> {
    public readonly id: string;
    private readonly $emitterIdList: string[];
    private readonly $emitterList: Emitter<E>[];

    public handleEvent(event: E) {
        
    }

    constructor(
        config?: string[]
    ) {
        const [ id, ...emitterIdList ] = config || [];
        this.id = id || window.$app.referenceService.getUniqId();
        this.$emitterIdList = emitterIdList;
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

    /** 初始化事件处理器队列 */
    public mountRoot() {
        window.$app.referenceService.handlerDict[this.id] = this;
        for (const emitterId of this.$emitterIdList) {
            const emitter = window.$app.referenceService.emitterDict[emitterId];
            if (emitter) {
                emitter.bindHandler(this);
            }
        }
    }

    /** 构建序列化参数 */
    public makeBundle(): string[] {
        const bundle: string[] = [];
        for (const emitter of this.$emitterList) {
            bundle.push(emitter.id);
        }
        return bundle;
    }

    /** 从根节点卸载，解除依赖关系  */
    public unmountRoot() {
        this.$emitterList.forEach(item => {
            item.unbindHandler(this);
        });
        delete window.$app.referenceService.handlerDict[this.id];
    }
}

export class HandlerDictProxy<E extends IBase.Dict> {
    public readonly handlerDict: IModel.HandlerDict<E>;
    private readonly $handlerBundleDict?: IModel.HandlerBundleDict<E>;

    constructor(
        config?: IModel.HandlerBundleDict<E>
    ) {
        this.$handlerBundleDict = config;
        const handlerDict = {} as IModel.HandlerDict<E>;
        for (const key in config) {
            handlerDict[
                key as IReflect.Key<IModel.HandlerDict<E>>
            ] = new Handler(config[key]);
        }
        this.handlerDict= new Proxy(handlerDict, {
            get: (origin, key: IReflect.Key<IModel.HandlerDict<E>>) => {
                if (!origin[key]) {
                    origin[key] = new Handler();
                }
                return origin[key];
            },
            set: () => false
        });
    }

    public mountRoot() {
        for (const key in this.$handlerBundleDict) {
            const emitter = this.handlerDict[key];
            emitter.mountRoot();
        }
    }

    public unmountRoot() {
        for (const key in this.handlerDict) {
            this.handlerDict[key].unmountRoot();
        }
    }

    public makeBundle() {
        const bundle = {} as any;
        for (const key in this.handlerDict) {
            bundle[key] = this.handlerDict[key].makeBundle();
        }
        return bundle;
    }
}
