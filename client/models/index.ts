import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";
import { Emitter, Handler } from "../utils/emitter";
import { Entity } from "../utils/entity";

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

    private readonly $config: IModel.BaseConfig<M>;
    protected $activated?: boolean;

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
    public readonly emitterDict!: IModel.EmitterDict<M>;
    protected readonly $handlerFuncDict!: IModel.HandlerFuncDict<M>;
    protected readonly $handlerDict!: IModel.HandlerDict<M>;

    /** 测试用例 */
    public debuggerDict: Record<string, IBase.Func>;
    public readonly stateSetterList: IBase.Func[] = [];
    public readonly childrenSetterList: IBase.Func[] = [];

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

    constructor(
        config: IModel.BaseConfig<M>,
        app: App
    ) {
        super(app);
        this.$status = ModelStatus.CREATED;
        this.$activated = config.activated;
        this.$config = config;

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

        /** 依赖关系 */
        this.emitterDict = new Proxy({} as any, {
            get: (origin, key: string) => {
                if (!origin[key]) origin[key] = new Emitter(this, key);
                return origin[key];
            },
            set: () => false
        });
        this.$handlerDict = new Proxy({} as any, {
            get: (origin, key: string) => {
                if (!origin[key]) {
                    origin[key] = new Handler(
                        this.$handlerFuncDict[key],
                        this,
                        key
                    );
                }
                return origin[key];
            },
            set: () => false
        });

        /** 从属关系 */
        this.$childList = [];
        this.$childDict = new Proxy({} as IModel.ChildDict<M>, {
            set: (origin, key: IReflect.Key<IModel.ChildDefDict<M>>, value: Model) => {
                origin[key] = value as any;
                value.$bindParent(this);
                if (this.$status === ModelStatus.INITED) {
                    value.$initialize();
                }
                this.$setChildren();
                return true;
            }
        });
        for (const key in config.childBundleDict) {
            const chunk = config.childBundleDict[key];
            this.$childDict[key] = app.factoryService.unserialize(chunk);
        }
        for (const bundle of config.childBundleList) {
            const model = app.factoryService.unserialize(bundle);
            this.$appendChild(model);
        }

        /** 调试器 */
        this.debuggerDict = {};
    }

    /** 挂载父节点 */
    public $bindParent(parent: IModel.Parent<M>) {
        this.$parent = parent;
        console.log('bind_parent', this.constructor.name);
        /** 如果父节点从属于根节点，则触发根节点挂载 */
        if (
            /** 如果父节点等于自身，则自身为根节点 */
            this.$parent === this ||
            this.$parent.status === ModelStatus.MOUNTED ||
            this.$parent.status === ModelStatus.INITED
        ) {
            this.$mountRoot();
        }
        this.$status = ModelStatus.BINDED;
    }

    /** 挂载根节点 */
    public $mountRoot() {
        this.$status = ModelStatus.MOUNTING;
        console.log('mount_root', this.constructor.name);
        /** 注册唯一标识 */
        this.app.referenceService.addRefer(this);
        /** 依赖关系遍历 */
        for (const key in this.$config.emitterBundleDict) {
            const handlerIdList = this.$config.emitterBundleDict[key];
            if (handlerIdList) {
                for (const id of handlerIdList) {
                    const [ modelId, handlerKey ] = id.split('_');
                    const model = this.app.referenceService.referDict[modelId];
                    if (model) {
                        this.emitterDict[key].bindHandler(model.$handlerDict[handlerKey]);
                    }
                }
            }
        }
        for (const key in this.$config.handlerBundleDict) {
            const emitterIdList = this.$config.handlerBundleDict[key];
            if (emitterIdList) {
                for (const id of emitterIdList) {
                    const [ modelId, emitterKey ] = id.split('_');
                    const model = this.app.referenceService.referDict[modelId];
                    if (model) {
                        model.emitterDict[emitterKey].bindHandler(this.$handlerDict[key]);
                    }
                }
            }
        }
        /** 从属关系遍历 */
        for (const child of this.$childList) {
            child.$mountRoot();
        }
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$mountRoot();
        }
        this.$status = ModelStatus.MOUNTED;
    }

    public $unmountRoot() {
        this.$status = ModelStatus.UNMOUNTING;
        console.log('unmount_root', this.constructor.name);
        /** 依赖关系遍历 */
        for (const key in this.emitterDict) {
            const emitter = this.emitterDict[key];
            emitter.unmountRoot();
        }
        for (const key in this.$handlerDict) {
            const handler = this.$handlerDict[key];
            handler.unmountRoot();
        }
        /** 从属关系遍历 */
        for (const child of this.$childList) {
            child.$unmountRoot();
        }
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$unmountRoot();
        }
        this.app.referenceService.removeRefer(this);
        this.$status = ModelStatus.UNMOUNTED;
    }

    public $unbindParent() {
        if (this.status === ModelStatus.INITED) {
            this.$unmountRoot();
        }
        this.$parent = undefined;
        this.$status = ModelStatus.UNBINDED;
    }

    /** 初始化 */
    public initialize() {}
    public $initialize() {
        this.$status = ModelStatus.INITING;
        if (!this.$activated) {
            console.log('initialize', this.constructor.name);
            this.initialize();
            this.$activated = true;
        }
        /** 遍历 */
        this.$childList.forEach(child => {
            child.$initialize();
        });
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$initialize();
        }
        this.$status = ModelStatus.INITED;
    }

    /** 添加子节点 */
    protected $appendChild(target: IReflect.Iterator<IModel.ChildList<M>>) {
        this.$childList.push(target);
        target.$bindParent(this); 
        if (this.status === ModelStatus.INITED) {
            target.$initialize();
        }
        this.$setChildren();
    }

    /** 移除子节点 */
    protected $removeChild(target: 
        IReflect.Iterator<IModel.ChildList<M>> | 
        IReflect.Value<IModel.ChildDict<M>>) {
        const index = this.$childList.indexOf(target);
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

    /** 更新状态 */
    public updateState<K extends IReflect.Key<IModel.State<M>>>(key: K) {   
        const prev = this.$currentState[key];
        const current = this.$originState[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        const stateUpdateBefore = this.emitterDict[`${key}UpdateBefore`] as any;
        const stateUpdateDone = this.emitterDict[`${key}UpdateDone`] as any;
        stateUpdateBefore.emitEvent(event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            if (this.$status === ModelStatus.INITED) {
                stateUpdateDone.emitEvent(event);
                this.$setState();
            }
        }
    }

    /** 序列化函数 */
    public serialize(): IModel.Bundle<M> {
        const childBundleDict = {} as any;
        for (const key in this.childDict) {
            const child = this.childDict[key];
            childBundleDict[key] = child.serialize();
        }
        const childBundleList = this.childList.map(child => {
            return child.serialize(); 
        });

        const emitterIdDict = {} as any;
        for (const key in this.emitterDict) {
            const emitter = this.emitterDict[key];
            emitterIdDict[key] = emitter.makeBundle();
        }
        const handlerIdDict = {} as any;
        for (const key in this.$handlerDict) {
            const handler = this.$handlerDict[key];
            handlerIdDict[key] = handler.makeBundle();
        }

        return {
            id: this.id,
            code: this.code,
            rule: this.rule,
            originState: this.$originState,
            childBundleDict,
            childBundleList,
            emitterBundleDict: emitterIdDict,
            handlerBundleDict: handlerIdDict,
            activated: true
        };
    }
}