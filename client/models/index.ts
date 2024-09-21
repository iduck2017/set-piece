import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";
import { childDictProxy, childListProxy } from "../utils/child";
import { Emitter } from "../utils/emitter";
import { Entity } from "../utils/entity";
import { Handler } from "../utils/handler";

/** 模型基类 */
export abstract class Model<
    M extends IModel.Define = IModel.Define
> extends Entity {
    /** 状态机 */
    private $status: ModelStatus;
    public get status() { return this.$status; }

    /** 基本信息 */
    public readonly id: string;
    public readonly code: IModel.Code<M>;
    public readonly rule: Partial<IModel.Rule<M>>;

    private $inited?: boolean;

    /** 数据结构 */
    protected readonly $originState: IModel.State<M>;
    private readonly $currentState: IModel.State<M>;
    public get currentState() { return { ...this.$currentState }; }
    
    /** 从属关系 */
    private $parent?: IModel.Parent<M>;
    public get parent() {
        const parent = this.$parent;
        if (!parent) throw new Error();
        return parent;
    }
    public get root() {
        const root = this.app.root;
        if (!root) throw new Error();
        return root;
    }

    private readonly $hooks: {
        childList: IModel.HookDict;
        childDict: IModel.HookDict;
    };

    public readonly $childDict: IModel.ChildDict<M>;
    public readonly $childList: IModel.ChildList<M>;

    public get childList() { return [ ...this.$childList ]; }
    public get childDict() { return { ...this.$childDict }; }
    public get children(): Model[] {
        return [
            ...this.childList,
            ...Object.values(this.childDict)
        ];
    }

    /** 事件触发器/处理器 */
    public readonly eventEmitterDict: IModel.EventEmitterDict<M>;
    public readonly stateUpdaterDict: IModel.StateUpdaterDict<M>;
    public readonly stateEmitterDict: IModel.StateEmitterDict<M>;

    public readonly $handlerDict: IModel.EventHandlerDict<M>;
    public abstract readonly $handlerCallerDict: IModel.EventHandlerCallerDict<M>;

    /** 测试用例 */
    public debuggerDict: Record<string, IBase.Func>;
    public readonly stateSetterList: IBase.Func[] = [];
    public readonly childrenSetterList: IBase.Func[] = [];

    public $setChildren() {
        this.childrenSetterList.forEach(setter => {
            setter(this.children);
        });
    }
    private $setState() {
        const result = this.currentState;
        console.log('set_state', result);
        this.stateSetterList.forEach(setter => {
            setter(result);
        });
    }

    private $initEmitterDict(config?: IModel.EmitterBundleDict<IBase.Dict>) {
        const emitterDict = {} as any;
        for (const key in config) {
            const bundleList = config[key] || [];
            const emitter = new Emitter(    
                bundleList,
                key,
                this,
                this.app
            );
            emitterDict[key] = emitter;
        }
        return new Proxy(emitterDict, {
            get: (origin, key: string) => {
                if (!origin[key]) {
                    origin[key] = new Emitter([], key, this, this.app);
                }
                return origin[key];
            },
            set: () => false
        });
    }

    private $initHandlerDict(config?: IModel.HandlerBundleDict<IModel.HandlerDefDict<M>>) {
        const handlerDict = {} as IModel.EventHandlerDict<M>;
        if (config) {
            Object.keys(config).forEach((
                key: IReflect.Key<IModel.EventHandlerDict<M>>
            ) => {
                const handler = new Handler(
                    config[key] || [],
                    key,
                    this,
                    this.app
                );
                handlerDict[key] = handler;
            });
        }
        return new Proxy(handlerDict, {
            get: (origin, key: IReflect.Key<IModel.EventHandlerDict<M>>) => {
                if (!origin[key]) {
                    origin[key] = new Handler(
                        [],
                        key,
                        this,
                        this.app
                    );
                }
                return origin[key];
            },
            set: () => false
        });
    }

    constructor(
        config: IModel.BaseConfig<M>,
        app: App
    ) {
        super(app);
        this.$status = ModelStatus.CREATED;
        this.$inited = config.inited;

        console.log('constructor', this.constructor.name);
        
        /** 基本信息 */
        this.id = config.id || app.referenceService.getUniqId();
        this.code = config.code;
        this.rule = config.rule || {};
        
        /** 数据结构 */
        this.$originState = new Proxy(config.originState, {
            set: (origin, key: IReflect.Key<IModel.State<M>>, value) => {
                origin[key] = value;
                this.updateState(key);
                return true;
            }
        });
        this.$currentState = { ...this.$originState };

        /** 
         * 初始化从属关系
         * 初始化依赖关系
         */
        const childList = childListProxy(config.childBundleList, this, this.app);
        this.$childList = childList.proxy;

        const childDict = childDictProxy(config.childBundleDict, this, this.app);
        this.$childDict = childDict.proxy;

        this.$hooks = {
            childDict: childDict.hooks,
            childList: childList.hooks
        };

        this.eventEmitterDict = this.$initEmitterDict(config.eventEmitterBundleDict);
        this.stateUpdaterDict = this.$initEmitterDict(config.stateUpdaterBundleDict);
        this.stateEmitterDict = this.$initEmitterDict(config.stateEmitterBundleDict);

        this.$handlerDict = this.$initHandlerDict(config.eventHandlerBundleDict);

        /** 调试器 */
        this.debuggerDict = {};
    }

    /** 挂载父节点 */
    public $bindParent(parent: IModel.Parent<M>) {
        this.$parent = parent;
        console.log('bind_parent', this.constructor.name);
        this.$status = ModelStatus.BINDED;
        /** 如果父节点从属于根节点，则触发根节点挂载 */
        if (
            /** 如果父节点等于自身，则自身为根节点 */
            this.$parent === this ||
            this.$parent.status === ModelStatus.MOUNTED 
        ) {
            this.$mountRoot();
        }
    }

    /** 挂载根节点 */
    public $mountRoot() {
        this.$status = ModelStatus.MOUNTING;
        console.log('mount_root', this.constructor.name);
        /** 注册唯一标识 */
        this.app.referenceService.addRefer(this);
        /** 依赖关系遍历 */
        for (const key in this.eventEmitterDict) {
            const emitter = this.eventEmitterDict[key];
            emitter.mountRoot();
        }
        for (const key in this.stateUpdaterDict) {
            const emitter = this.stateUpdaterDict[key];
            emitter.mountRoot();
        }
        for (const key in this.stateEmitterDict) {
            const emitter = this.stateEmitterDict[key];
            emitter.mountRoot();
        }
        for (const key in this.$handlerDict) {
            const handler = this.$handlerDict[key];
            handler.mountRoot();
        }
        /** 从属关系遍历 */
        this.$hooks.childList.$mountRoot();
        this.$hooks.childDict.$mountRoot();
        this.$status = ModelStatus.MOUNTED;
    }

    public $unmountRoot() {
        this.$status = ModelStatus.UNMOUNTING;
        console.log('unmount_root', this.constructor.name);
        /** 依赖关系遍历 */
        for (const key in this.eventEmitterDict) {
            const emitter = this.eventEmitterDict[key];
            emitter.unmountRoot();
        }
        for (const key in this.stateUpdaterDict) {
            const emitter = this.stateUpdaterDict[key];
            emitter.unmountRoot();
        }
        for (const key in this.$handlerDict) {
            const handler = this.$handlerDict[key];
            handler.unmountRoot();
        }
        for (const key in this.stateEmitterDict) {
            const emitter = this.stateEmitterDict[key];
            emitter.unmountRoot();
        }
        /** 从属关系遍历 */
        this.$hooks.childList.$unmountRoot();
        this.$hooks.childDict.$unmountRoot();
        this.app.referenceService.removeRefer(this);
        this.$status = ModelStatus.UNMOUNTED;
    }

    public $unbindParent() {
        if (this.status === ModelStatus.MOUNTED) {
            this.$unmountRoot();
        }
        console.log('unbind_parent', this.constructor.name);
        this.$parent = undefined;
        this.$status = ModelStatus.UNBINDED;
    }

    /** 初始化 */
    public bootDriver() {}
    public $bootDriver() {
        if (!this.$inited) {
            console.log('boot_model', this.constructor.name);
            this.bootDriver();
            this.$inited = true;
        }
        /** 遍历 */
        this.$hooks.childList.$bootDriver();
        this.$hooks.childDict.$bootDriver();
    }

    public unbootDriver() {}
    public $unbootDriver() {
        if (this.$inited) {
            console.log('unboot_model', this.constructor.name);
            this.unbootDriver();
            this.$inited = false;
        }
        /** 遍历 */
        this.$hooks.childList.$unbootDriver();
        this.$hooks.childDict.$unbootDriver();
    }

    /** 更新状态 */
    public updateState<K extends IReflect.Key<IModel.State<M>>>(key: K) {   
        const prev = this.$currentState[key];
        const current = this.$originState[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this.stateUpdaterDict[key].emitEvent(event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            if (this.$status === ModelStatus.MOUNTED) {
                this.stateEmitterDict[key].emitEvent(event);
                this.$setState();
            }
        }
    }

    /** 序列化函数 */
    public makeBundle(): IModel.Bundle<M> {
        const eventEmitterBundleDict = {} as any;
        for (const key in this.eventEmitterDict) {
            const emitter = this.eventEmitterDict[key];
            eventEmitterBundleDict[key] = emitter.makeBundle();
        }
        const eventHandlerBundleDict = {} as any;
        for (const key in this.$handlerDict) {
            const handler = this.$handlerDict[key];
            eventHandlerBundleDict[key] = handler.makeBundle();
        }
        const stateUpdaterBundleDict = {} as any;
        for (const key in this.stateUpdaterDict) {
            const emitter = this.stateUpdaterDict[key];
            stateUpdaterBundleDict[key] = emitter.makeBundle();
        }
        const stateEmitterBundleDict = {} as any;
        for (const key in this.stateEmitterDict) {
            const emitter = this.stateEmitterDict[key];
            stateEmitterBundleDict[key] = emitter.makeBundle();
        }

        return {
            id: this.id,
            code: this.code,
            rule: this.rule,
            originState: this.$originState,
            childBundleDict: this.$hooks.childDict.$makeBundle(),
            childBundleList: this.$hooks.childList.$makeBundle(),
            eventEmitterBundleDict,
            eventHandlerBundleDict,
            stateUpdaterBundleDict,
            stateEmitterBundleDict,
            inited: true
        };
    }
}