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
    protected readonly $event: {
        [K in IReflect.KeyOf<ModelType.HandlerDict<M>>]: {
            call: ModelType.EmitterCallerDict<M>[K];
            bind: ModelType.EmitterBinderDict<M>[K];
            unbind: ModelType.EmitterBinderDict<M>[K];
        }
    };
    public readonly event: {
        [K in IReflect.KeyOf<ModelType.HandlerDict<M>>]: {
            bind: ModelType.EmitterBinderDict<M>[K];
            unbind: ModelType.EmitterBinderDict<M>[K];
        }
    };
    protected readonly $emitterListDict: ModelType.EmitterListDict<M>;
    protected readonly $handlerListDict: ModelType.HandlerListDict<M>;
    protected abstract readonly $handlerCallerDict: ModelType.HandlerCallerDict<M>;

    protected $callEmitter<
        K extends IReflect.KeyOf<ModelType.EmitterEventDict<M>>
    >(
        key: K,
        event: ModelType.EmitterEventDict<M>[K]
    ) {
        const emitterModelList = this.$emitterListDict[key];
        emitterModelList.forEach((model: any) => {
            model.$event[key].call(event);
        });
    }

    private $bindHandler<
        K extends IReflect.KeyOf<ModelType.HandlerDict<M>>
    >(
        key: K,
        handler: ModelType.HandlerDict<M>[K]
    ) {
        handler.$emitterListDict[key].push(this as any);
        this.$handlerListDict[key].push(handler);
    }

    private $unbindHandler<K extends IReflect.KeyOf<ModelType.HandlerDict<M>>>(
        key: K,
        handler: ModelType.HandlerDict<M>[K]
    ) {
        const handlerIndex = handler.$emitterListDict[key].indexOf(this as any);
        const emitterIndex = this.$handlerListDict[key].indexOf(handler);
        if (handlerIndex < 0 || emitterIndex < 0) {
            throw new Error();
        }
        handler.$emitterListDict[key]?.splice(handlerIndex, 1);
        this.$handlerListDict[key]?.splice(emitterIndex, 1);
    }

    public unserializeModelDict(chunk?: Record<string, string[] | undefined>) {
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


    /** 状态修饰器代理 */
    // private readonly $updaterProxy: UpdaterProxy<M>;
    // protected readonly $updaterDict: ModelType.UpdaterDict<M>;
    // public readonly updaterDict: ModelType.SafeUpdaterDict<M>;

    /** 事件接收器代理 */
    // private readonly $handlerProxy: HandlerProxy<M[ModelKey.HandlerEventDict], Model<M>>;
    // protected readonly $handlerDict: 
    //     ConnectorType.HandlerDict<M[ModelKey.HandlerEventDict], Model<M>>;

    /** 事件触发器代理 */
    // private readonly $emitterProxy: EmitterProxy<M[ModelKey.EmitterEventDict], Model<M>>;
    // protected readonly $emitterDict: 
    //     ConnectorType.EmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;
    // public readonly emitterDict: 
    //     ConnectorType.SafeEmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;

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
 
        /** 初始化状态更新器 */
        // this.$updaterProxy = new UpdaterProxy<M>(
        //     config.updaterChunkDict, 
        //     this,
        //     app
        // );
        // this.$updaterDict = this.$updaterProxy.updaterDict;
        // this.updaterDict = this.$updaterProxy.safeUpdaterDict;
        
        // /** 初始化事件触发器 */
        // this.$emitterProxy = new EmitterProxy(
        //     config.emitterChunkDict, 
        //     this,
        //     app
        // );
        // this.$emitterDict = this.$emitterProxy.emitterDict;
        // this.emitterDict = this.$emitterProxy.safeEmitterDict;

        // this.$handlerProxy = new HandlerProxy(
        //     loader,
        //     config.handlerChunkDict,
        //     this,
        //     app
        // );
        // this.$handlerDict = this.$handlerProxy.handlerDict;

        this.$handlerListDict = this.unserializeModelDict(config.handlerChunkDict);
        this.$emitterListDict = this.unserializeModelDict(config.emitterChunkDict);

        this.$event = new Proxy(
            {} as any,
            {
                get: (target, key) => {
                    return {
                        call: this.$callEmitter.bind(this, key),
                        bind: this.$bindHandler.bind(this, key),
                        unbind: this.$unbindHandler.bind(this, key)
                    };
                },
                set: () => false
            }
        );
        this.event = new Proxy(
            {} as any,
            {
                get: (target, key) => {
                    return {
                        bind: this.$bindHandler.bind(this, key),
                        unbind: this.$unbindHandler.bind(this, key)
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
        // this.$emitterProxy.destroy();
        // this.$handlerProxy.destroy();
        // this.$updaterProxy.destroy();
        Object.keys(this.$handlerListDict).forEach((
            key: IReflect.KeyOf<M[ModelKey.EventDict]>
        ) => {
            const handlerList = this.$handlerListDict[key];
            handlerList.forEach(model => {
                this.$unbindHandler(key, model);
            });
        });
        // Object.keys(this.$handlerModelDict).forEach((
        //     key: IReflect.KeyOf<M[ModelKey.HandlerEventDict]>
        // ) => {
        //     const handlerModelList = this.$handlerModelDict[key];
        //     handlerModelList.forEach(model => {
        //         model.$unbindEmitter(key, this);
        //     }); 
        // });
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
        this.$callEmitter(
            `${key}UpdateBefore` as ModelType.StateUpdateBefore<K>, 
            event as ModelType.EmitterEventDict<M>[ModelType.StateUpdateBefore<K>]
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

        const emitterIdDict = {} as ModelType.EmitterChunkDict<M>;
        Object.keys(this.$emitterListDict).forEach((
            key: IReflect.KeyOf<M[ModelKey.EventDict]>
        ) => {
            const emitterModelList = this.$emitterListDict[key];
            emitterIdDict[key] = emitterModelList.map(model => {
                return model.id;
            });
        });
        const handlerIdDict = {} as ModelType.HandlerChunkDict<M>;
        Object.keys(this.$handlerListDict).forEach((
            key: IReflect.KeyOf<M[ModelKey.EmitterDefDict]>
        ) => {
            const handlerModelList = this.$handlerListDict[key];
            handlerIdDict[key] = handlerModelList.map(model => {
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
            emitterIdDict,
            handlerIdDict
        };
    }
}