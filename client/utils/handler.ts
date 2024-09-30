import { IBase, IReflect } from "../type";
import { IModel } from "../type/model";
import type { Emitter } from "./emitter";

// 事件处理器
export class Handler<E = any> {
    public readonly id: string;

    // 事件触发器列表
    private readonly $emitterList: Emitter<E>[];
    private readonly $emitterIdList: string[];
    
    constructor(
        config?: string[]
    ) {
        const [ id, ...emitterIds ] = config || [];
        this.id = id || window.$app.reference.register();
        this.$emitterList = [];
        this.$emitterIdList = emitterIds;
    }

    // 处理事件
    public handleEvent(event: E) {
        console.log(event);
        throw new Error("Method not implemented.");
    }

    // 添加事件触发器
    public $appendEmitter(target: Emitter<E>) {
        this.$emitterList.push(target);
    }

    // 移除事件触发器
    public $removeEmitter(target: Emitter<E>) {
        const index = this.$emitterList.indexOf(target);
        if (index >= 0) {
            this.$emitterList.splice(index, 1);
        }
    }

    // 挂载到根节点
    public mountRoot() {
        window.$app.reference.handlerDict[this.id] = this;
        for (const id of this.$emitterIdList) {
            const emitter = window.$app.reference.emitterDict[id];
            if (emitter) {
                emitter.bindHandler(this);
            }
        }
    }

    // 从根节点卸载
    public unmountRoot() {
        this.$emitterList.forEach(item => {
            item.unbindHandler(this);
        });
        delete window.$app.reference.handlerDict[this.id];
    }

    // 创建序列化对象
    public makeBundle(): string[] {
        const bundle: string[] = [ this.id ];
        for (const emitter of this.$emitterList) {
            bundle.push(emitter.id);
        }
        return bundle;
    }
}


// 事件处理器代理
export class HandlerProxy<E extends IBase.Dict> {
    // 事件处理器字典
    public readonly dict: IModel.HandlerDict<E>;

    constructor(
        config?: IModel.HandlerBundleDict<E>
    ) {
        const origin = {} as IModel.HandlerDict<E>;
        if (config) {
            Object.keys(config).forEach((
                key: IReflect.Key<IModel.HandlerDict<E>>
            ) => {
                const handlerConfig = config[key];
                const handler = new Handler(handlerConfig);
                origin[key] = handler;
            });
        }

        this.dict= new Proxy(origin, {
            get: (origin, key: IReflect.Key<IModel.HandlerDict<E>>) => {
                if (!origin[key]) {
                    origin[key] = new Handler();
                }
                return origin[key];
            },
            set: () => false
        });
    }

    // 初始化特性
    public activateFeat(
        callerDict: IModel.HandlerCallerDict<E>
    ) {
        for (const key in callerDict) {
            const handler = this.dict[key];
            if (handler) {
                handler.handleEvent = callerDict[key];
            }
        }
    }

    // 挂载到根节点
    public mountRoot() {
        for (const key in this.dict) {
            const emitter = this.dict[key];
            emitter.mountRoot();
        }
    }

    // 从根节点卸载
    public unmountRoot() {
        for (const key in this.dict) {
            this.dict[key].unmountRoot();
        }
    }

    // 创建序列化对象
    public makeBundle() {
        const bundle = {} as IModel.HandlerBundleDict<E>;
        Object.keys(this.dict).forEach((
            key: IReflect.Key<E>
        ) => {
            bundle[key] = this.dict[key].makeBundle();
        });
        return bundle;
    }
}