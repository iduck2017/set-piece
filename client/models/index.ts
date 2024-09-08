import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { BaseModelDef } from "../type/definition";
import { EventType } from "../type/event";
import { ModelType } from "../type/model";
import { ModelKey } from "../type/registry";

/**
 * 反序列化阶段
 * 1. 节点被创建 Inited
 * 2. 节点挂载到父节点 Binded
 * 3. 节点挂载到根节点 Mounted
 * 
 * 初始化阶段
 * 4. 节点业务逻辑执行 Activated
 * 5. 节点业务状态流转，例如生物成熟、生殖死亡
 * 6. 节点业务逻辑销毁 Deactivated 
 * 
 * 销毁阶段
 * 7. 节点卸载自根节点 Unmounted
 * 8. 节点卸载自父节点 Unbinded
 * 9. 节点销毁完成 Destroyed
 */
export abstract class Model<
    M extends BaseModelDef = BaseModelDef
> {
    /** 外部指针 */
    public readonly app: App;
    public readonly parent: M[ModelKey.Parent];
    public get root() {
        const result = this.app.root;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    /** 基本信息 */
    public readonly id: string;
    public readonly code: M[ModelKey.Code];

    /** 预设参数 */
    protected $inited: boolean;
    private readonly $preset: Partial<M[ModelKey.Preset]>;

    /** 状态 */
    protected readonly $originState: M[ModelKey.State];
    private readonly $currentState: M[ModelKey.State]; 
    public get currentState() { 
        return { ...this.$currentState }; 
    }
    
    /** 子节点 */
    public readonly $childDict: ModelType.ChildDict<M>;
    public readonly $childList: ModelType.ChildList<M>;
    public get childList() {
        return [ ...this.$childList ];
    }
    public get childDict() {
        return { ...this.$childDict };
    }
    public get children(): Model[] {
        return [
            ...this.childList,
            ...Object.values(this.childDict)
        ];
    }

    /** 事件触发器 */
    protected readonly $producerListDict = {} as ModelType.ProducerListDict<M>;
    protected readonly $consumerListDict = {} as ModelType.ConsumerListDict<M>;

    protected abstract readonly $handlerDict: ModelType.HandlerDict<M>;
    protected readonly $emitterDict: ModelType.EmitterDict<M>;
    public readonly event: ModelType.BinderDict<M>;

    protected $emitProvider<
        K extends IReflect.KeyOf<ModelType.ConsumerEventDict<M>>
    >(
        key: K,
        event: ModelType.ConsumerEventDict<M>[K]
    ) {
        const consumerModelList = this.$consumerListDict[key];
        consumerModelList.forEach((model: Model) => {
            model.$handlerDict[key].call(model, event);
        });
    }

    protected $emitComputer<
        K extends IReflect.KeyOf<M[ModelKey.State]>
    >(
        key: K,
        event: EventType.StateUpdateBefore<M, K>
    ) {
        const consumerModelList = this.$consumerListDict[key];
        consumerModelList.forEach((model: Model) => {
            model.$handlerDict[`${key}UpdateBefore`].call(model, event);
        });
    }

    protected $emitterObserver<
        K extends IReflect.KeyOf<M[ModelKey.State]>
    >(
        key: K,
        event: EventType.StateUpdateDone<M, K>
    ) {
        const consumerModelList = this.$consumerListDict[key];
        consumerModelList.forEach((model: Model) => {
            model.$handlerDict[`${key}UpdateDone`].call(model, event);
        });
    }

    private $bindConsumer<
        K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>
    >(
        key: K,
        handler: ModelType.ConsumerDict<M>[K]
    ) {
        handler.$producerListDict[key].push(this);
        this.$consumerListDict[key].push(handler);
    }

    private $unbindConsumer<K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>>(
        key: K,
        handler: ModelType.ConsumerDict<M>[K]
    ) {
        const handlerIndex = handler.$producerListDict[key].indexOf(this);
        const emitterIndex = this.$consumerListDict[key].indexOf(handler);
        if (handlerIndex < 0 || emitterIndex < 0) {
            throw new Error();
        }
        handler.$producerListDict[key].splice(handlerIndex, 1);
        this.$consumerListDict[key].splice(emitterIndex, 1);
    }

    private $initProducerListDict(chunk?: ModelType.ProducerChunkDict<M>) {
        const origin = this.$producerListDict
        chunk = chunk || {};
        return new Proxy(origin, {
            get: <K extends IReflect.KeyOf<ModelType.ProducerDict<M>>>(
                origin: ModelType.ProducerListDict<M>, 
                key: K
            ) => {
                if (!origin[key]) {
                    origin[key] = [];
                }
                return origin[key];
            },
            set: () => false
        });
    }

    private $initConsumerListDict(chunk?: ModelType.ConsumerChunkDict<M>) {
        const origin = this.$consumerListDict
        chunk = chunk || {};
        return new Proxy(origin, {
            get: <K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>>(
                origin: ModelType.ConsumerListDict<M>, 
                key: K
            ) => {
                if (!origin[key]) {
                    origin[key] = [];
                }
                return origin[key];
            },
            set: () => false
        });
    }

    /** 测试用例 */
    public debuggerDict: Record<string, IBase.Func>;
    public readonly stateSetterList: IBase.Func[] = [];
    public readonly childrenSetterList: IBase.Func[] = [];
    public readonly producerSetterList: IBase.Func[] = [];
    public readonly consumerSetterList: IBase.Func[] = [];

    private $setChildren() {
        this.childrenSetterList.forEach(setter => {
            setter(this.children);
        });
    }
    private $setState() {
        this.stateSetterList.forEach(setter => {
            setter(this.currentState);
        });
    }
    private $setProducers() {
        this.producerSetterList.forEach(setter => {
            setter(this.$producerListDict);
        });
    }
    private $setConsumers() {
        this.consumerSetterList.forEach(setter => {
            setter(this.$consumerListDict);
        });
    }

    constructor(
        config: ModelType.Config<M>,
        parent: M[ModelKey.Parent],
        app: App
    ) {
        this.app = app;
        this.parent = parent;

        /** 基本信息 */
        this.id = config.id || app.referService.getUniqId();
        this.code = config.code;
        this.$inited = config.inited || false;
        this.$preset = config.preset || {};

        /** 事件 */
        this.$producerListDict = this.$initProducerListDict(config.consumerChunkDict);
        this.$consumerListDict = this.$initConsumerListDict(config.producerChunkDict);
        console.log(config.producerChunkDict, config.consumerChunkDict)
        Object.keys(config.producerChunkDict || {}).forEach(<
            K extends IReflect.KeyOf<ModelType.ProducerDict<M>>
        >(key: K) => {
            if (config.producerChunkDict) {
                const producerList = config.producerChunkDict[key] || [];
                producerList.forEach((id: string) => {
                    const model = app.referService.referDict[id];
                    if (model) {
                        model.$bindConsumer(key, this);
                    }
                });
            }
        })
        Object.keys(config.consumerChunkDict || {}).forEach(<
            K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>
        >(key: K) => {
            if (config.consumerChunkDict) {
                const consumerList = config.consumerChunkDict[key] || [];
                consumerList.forEach((id: string) => {
                    const model: any = app.referService.referDict[id];
                    if (model) {
                        this.$bindConsumer(key, model);
                    }
                });
            }
        })


        this.$emitterDict = new Proxy(
            {} as any,
            {
                get: <K extends IReflect.KeyOf<ModelType.EmitterDict<M>>>(
                    target: any, 
                    key: K
                ) => {
                    return this.$emitProvider.bind(this, key);
                },
                set: () => false
            }
        );
        this.event = new Proxy(
            {} as any,
            {
                get: <K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>>(
                    target: any, 
                    key: K
                ) => {
                    return {
                        bind: this.$bindConsumer.bind(this, key),
                        unbind: this.$unbindConsumer.bind(this, key)
                    };
                },
                set: () => false
            }
        );

        /** 初始化状态 */
        this.$originState = new Proxy(config.originState, {
            set: (origin, key: IReflect.KeyOf<M[ModelKey.State]>, value) => {
                origin[key] = value;
                this.updateState(key);
                return true;
            }
        });
        this.$currentState = { 
            ...this.$originState
        };

        /** 树形结构 */
        this.$childList = config.childChunkList.map(chunk => {
            return app.factoryService.unserialize(chunk, this);
        });
        const origin = {} as ModelType.ChildDict<M>;
        for (const key in config.childChunkDict) {
            const chunk = config.childChunkDict[key];
            origin[key] = app.factoryService.unserialize(chunk, this);
        }
        this.$childDict = new Proxy(origin, {
            set: (origin, key: IReflect.KeyOf<M[ModelKey.ChildDefDict]>, value) => {
                origin[key] = value;
                this.$setChildren();
                return true;
            }
        });
        this.debuggerDict = {};
    }

    /** 初始化 */
    public $initialize() {
        this.$inited = true;
        this.$childList.forEach((child: Model) => {
            child.$initialize();
        });
        for (const key in this.$childDict) {
            const child: Model = this.childDict[key];
            child.$initialize();
        }
    }

    /** 添加子节点 */
    protected $appendChild(target: IReflect.IteratorOf<ModelType.ChildList<M>>) {
        this.$childList.push(target);
        this.$setChildren();
    }

    /** 移除子节点 */
    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target as any);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            this.$setChildren();
            return;
        }
        for (const key in this.$childDict) {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                this.$setChildren();
                return;
            }
        }
        throw new Error();
    }

    protected $destroy() {
        Object.keys(this.$consumerListDict).forEach((
            key: IReflect.KeyOf<ModelType.ConsumerDict<M>>
        ) => {
            const consumerList = this.$consumerListDict[key];
            consumerList.forEach(model => {
                this.$unbindConsumer(key, model);
            });
        });
        Object.keys(this.$producerListDict).forEach((
            key: IReflect.KeyOf<ModelType.ProducerDict<M>>
        ) => {
            const producerList = this.$producerListDict[key];
            producerList.forEach((model: any) => {
                model.$unbindConsumer(key, this);
            });
        });
        this.app.referService.removeRefer(this);
        this.$childList.forEach((child: Model) => {
            child.$destroy();
        });
        for (const key in this.$childDict) {
            const child: Model = this.childDict[key];
            child.$destroy();
        }
        if (this.parent) {
            this.parent.$removeChild(this);
        }
    }

    /** 更新状态 */
    public updateState<K extends IReflect.KeyOf<M[ModelKey.State]>>(key: K) {
        const prev = this.$currentState[key];
        const current = this.$originState[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this.$emitComputer(key, event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            this.$emitterObserver(key, event);
            this.$setState();
        }
    }

    /** 序列化函数 */
    public serialize(): ModelType.Chunk<M> {
        const childChunkDict = {} as any;
        for (const key in this.childDict) {
            const child = this.childDict[key];
            childChunkDict[key] = child.serialize();
        }
        const childChunkList = this.childList.map(child => {
            return child.serialize(); 
        });

        const producerChunkDict = {} as ModelType.ProducerChunkDict<M>;
        Object.keys(this.$producerListDict).forEach((
            key: IReflect.KeyOf<ModelType.ProducerDict<M>>
        ) => {
            const producerList = this.$producerListDict[key];
            producerChunkDict[key] = producerList.map((model: Model) => {
                return model.id;
            });
        });
        const consumerChunkDict = {} as ModelType.ConsumerChunkDict<M>;
        Object.keys(this.$consumerListDict).forEach((
            key: IReflect.KeyOf<ModelType.ConsumerDict<M>>
        ) => {
            const consumerList = this.$consumerListDict[key];
            consumerChunkDict[key] = consumerList.map((model: Model) => {
                return model.id;
            });
        });

        return {
            inited: true,
            id: this.id,
            code: this.code,
            preset: this.$preset,
            originState: this.$originState,
            childChunkDict,
            childChunkList,
            producerChunkDict,
            consumerChunkDict
        };
    }
}