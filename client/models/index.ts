import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { BaseModelDef } from "../type/definition";
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
    protected readonly $producerListDict: ModelType.ProducerListDict<M>;
    protected readonly $consumerListDict: ModelType.ConsumerListDict<M>;
    protected abstract readonly $handlerDict: ModelType.HandlerDict<M>;
    protected readonly $emitterDict: ModelType.EmitterDict<M>;

    protected $callProvider<
        K extends IReflect.KeyOf<ModelType.ConsumerEventDict<M>>
    >(
        key: K,
        event: ModelType.ConsumerEventDict<M>[K]
    ) {
        const emitterModelList = this.$consumerListDict[key];
        emitterModelList.forEach((model: any) => {
            model.$event[key].call(event);
        });
    }

    private $bindConsumer<
        K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>
    >(
        key: K,
        handler: ModelType.ConsumerDict<M>[K]
    ) {
        handler.$producerListDict[key].push(this as any);
        this.$consumerListDict[key].push(handler);
    }

    private $unbindConsumer<K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>>(
        key: K,
        handler: ModelType.ConsumerDict<M>[K]
    ) {
        const handlerIndex = handler.$producerListDict[key].indexOf(this as any);
        const emitterIndex = this.$consumerListDict[key].indexOf(handler);
        if (handlerIndex < 0 || emitterIndex < 0) {
            throw new Error();
        }
        handler.$producerListDict[key].splice(handlerIndex, 1);
        this.$consumerListDict[key].splice(emitterIndex, 1);
    }

    private $unserializeModelListDict(chunk?: Record<string, string[] | undefined>) {
        const origin = {} as any;
        for (const key in chunk) {
            if (!origin[key]) {
                origin[key] = [];
            }
            for (const id of chunk[key] || []) {
                const model = this.app.referService.referDict[id];
                if (model) {
                    origin[key]?.push(model);
                }
            }
        }
        return new Proxy(origin, {
            get: (origin, key) => {
                if (!origin[key]) {
                    origin[key] = [];
                }
                return origin[key];
            },
            set: () => false
        });
    }

    /** 测试用例 */
    public testcaseDict: Record<string, IBase.Func>;

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

        this.$producerListDict = this.$unserializeModelListDict(config.consumerChunkDict);
        this.$consumerListDict = this.$unserializeModelListDict(config.producerChunkDict);
        this.$emitterDict = new Proxy(
            {} as any,
            {
                get: <K extends IReflect.KeyOf<ModelType.ConsumerDict<M>>>(
                    target: any, 
                    key: K
                ) => {
                    return {
                        call: this.$callProvider.bind(this, key),
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
                this.updateState(`${key}UpdateBefore` as any);
                return true;
            }
        });
        this.$currentState = { 
            ...this.$originState
        };

        /** 初始化节点 */
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
                // this.$emitterCallerDict.childUpdateDone({
                //     target: this,
                //     children: this.children
                // });
                return true;
            }
        });
        this.testcaseDict = {};
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
        // this.$emitterCallerDict.childUpdateDone({
        //     target: this,
        //     children: this.children
        // });
    }

    /** 移除子节点 */
    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target as any);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            // this.$emitterCallerDict.childUpdateDone({
            //     target: this,
            //     children: this.children
            // });
            return;
        }
        for (const key in this.$childDict) {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                // this.$emitterCallerDict.childUpdateDone({
                //     target: this,
                //     children: this.children  
                // });
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
        this.$callProvider(
            `${key}UpdateBefore` as ModelType.StateUpdateBefore<K>, 
            event as ModelType.ConsumerEventDict<M>[ModelType.StateUpdateBefore<K>]
        );
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            // this.$emitterCallerDict.stateUpdateDone({
            //     target: this,
            //     state: this.currentState
            // });
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
            producerChunkDict[key] = producerList.map(model => {
                return model.id;
            });
        });
        const consumerChunkDict = {} as ModelType.ConsumerChunkDict<M>;
        Object.keys(this.$consumerListDict).forEach((
            key: IReflect.KeyOf<ModelType.ConsumerDict<M>>
        ) => {
            const consumerList = this.$consumerListDict[key];
            consumerChunkDict[key] = consumerList.map(model => {
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