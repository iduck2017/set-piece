import { IBase, IReflect } from "../type";
import type { IModel } from "../type/model";
import type { Handler } from "./handler";

// 事件触发器
export class Emitter<E = any> {
    public readonly modelId: string;
    

    // 事件处理器列表
    private readonly $handlerList: Handler<E>[];

    constructor(
        config?: string[]
    ) {
        const [ id, ...idList ] = config || [];
        this.id = id || window.$app.reference.register();
        this.$handlerIdList = idList;
        this.$handlerList = [];
    }

    // 添加事件处理器
    private $appendHandler(target: Handler<E>) {
        this.$handlerList.push(target);
    }

    // 移除事件处理器
    private $removeHandler(target: Handler<E>) {
        const index = this.$handlerList.indexOf(target);
        if (index >= 0) {
            this.$handlerList.splice(index, 1);
        }
    }

    // 绑定事件处理器
    public bindHandler(handler: Handler<E>) {
        handler.$appendEmitter(this);
        this.$appendHandler(handler);
    }

    // 解绑事件处理器
    public unbindHandler(handler: Handler<E>) {
        this.$removeHandler(handler);
        handler.$removeEmitter(this);
    }

    // 触发事件
    public emitEvent(event: E) {
        for (const handler of this.$handlerList) {
            handler.handleEvent(event);
        }
    }

    // 创建序列化对象
    public makeBundle(): string[] {
        const bundle: string[] = [ this.id ];
        for (const handler of this.$handlerList) {
            bundle.push(handler.id);
        }
        return bundle;
    }

    // 挂载到根节点
    public mountRoot() {
        window.$app.reference.emitterDict[this.id] = this;
        for (const handlerId of this.$handlerIdList) {
            const handler = window.$app.reference.handlerDict[handlerId];
            if (handler) {
                this.bindHandler(handler);
            }
        }
    }

    // 从根节点卸载
    public unmountRoot() {
        this.$handlerList.forEach(item => {
            this.unbindHandler(item);
        });
        delete window.$app.reference.emitterDict[this.id];
    }
}


// 事件触发器代理
export class EmitterProxy<E extends IBase.Dict> {
    // 事件触发器字典
    public readonly dict: IModel.EmitterDict<E>;

    constructor(
        config?: IModel.EmitterBundleDict<E>
    ) {
        const origin = {} as IModel.EmitterDict<E>;
        if (config) {
            Object.keys(config).forEach((
                key: IReflect.Key<E>
            ) => {
                const emitterBundle = config[key];
                const emitter = new Emitter(emitterBundle);
                origin[key] = emitter;
            });
        }

        this.dict= new Proxy(origin, {
            get: (origin, key: IReflect.Key<IModel.HandlerDict<E>>) => {
                if (!origin[key]) {
                    origin[key] = new Emitter();
                }
                return origin[key];
            },
            set: () => false
        });
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
        const bundle = {} as IModel.EmitterBundleDict<E>;
        Object.keys(this.dict).forEach((
            key: IReflect.Key<E>
        ) => {
            bundle[key] = this.dict[key].makeBundle();
        });
        return bundle;
    }
}
