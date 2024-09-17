import type { App } from "../app";
import { Generator } from "../configs/generator";
import { IBase, IReflect } from "../type";
import { IEvent } from "../type/event";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";
import { Entity } from "../utils/entity";

/** 数据模型基类 */
export abstract class Model<
    M extends IModel.Define = IModel.Define
> extends Entity {
    /** 外部指针 */
    private $parent?: IModel.Parent<M>;
    public get parent() {
        if (!this.$parent) throw new Error();
        return this.$parent;
    }

    public get root() {
        const result = this.app.root;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    /** 状态机 */
    private $status: ModelStatus;
    public get status() {
        return this.$status;
    }

    /** 基本信息 */
    public readonly id: string;
    public readonly code: IModel.Code<M>;
    public readonly rule: Partial<IModel.Rule<M>>;

    private readonly $config: IModel.BaseConfig<M>;
    protected $activated: boolean;

    /** 状态 */
    protected readonly $originState: IModel.State<M>;
    private readonly $currentState: IModel.State<M>;
    public get currentState() { 
        return { ...this.$currentState }; 
    }
    
    /** 从属模型 */
    public readonly $childDict: IModel.ChildDict<M>;
    public readonly $childList: IModel.ChildList<M>;
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
    protected readonly $listenedDict: IModel.ListenedDict<M>;
    protected readonly $listenerDict: IModel.ListenerDict<M>;
    protected readonly $observerDict: IModel.ObserverDict<M>;
    protected readonly $observedDict: IModel.ObservedDict<M>;
    protected readonly $modifiedDict: IModel.ModifiedDict<M>;
    protected readonly $modifierDict: IModel.ModifierDict<M>;

    protected abstract readonly $eventHandlerDict: IModel.EventHandlerDict<M>;
    protected readonly $eventEmitterDict: IModel.EventEmitterDict<M>;
    public readonly eventChannelDict: IModel.EventChannelDict<M>;


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
        this.$status = ModelStatus.UNINITED;
        console.log(this.constructor.name, 'inited');
        this.$config = config;

        /** 基本信息 */
        this.id = config.id || app.referenceService.getUniqId();
        this.code = config.code;
        this.rule = config.rule || {};
        
        this.$activated = config.inited || false;
        this.$listenedDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );
        this.$listenerDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );
        this.$observerDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );
        this.$observedDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );
        this.$modifiedDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );
        this.$modifierDict = Generator.readonlyProxy(
            (target, key) => {
                if (!target[key]) target[key] = [];
                return target[key];
            }
        );

        this.$eventEmitterDict = {
            listened: Generator.readonlyProxy(
                (target, key) => {
                    return this.$emitListener.bind(this, key);
                }
            ),
            observed: Generator.readonlyProxy(
                (target, key) => {
                    return this.$emitObserver.bind(this, key);
                }
            ),
            modified: Generator.readonlyProxy(
                (target, key) => {
                    return this.$emitModifier.bind(this, key);
                }
            )
        };
        this.eventChannelDict = {
            listened: Generator.readonlyProxy(
                (target, key) => {
                    return {
                        bind: this.$bindListener.bind(this, key),
                        unbind: this.$unbindListener.bind(this, key)
                    };
                }
            ),
            observed: Generator.readonlyProxy(
                (target, key) => {
                    return {
                        bind: this.$bindObserver.bind(this, key),
                        unbind: this.$unbindObserver.bind(this, key)
                    };
                }
            ),
            modified: Generator.readonlyProxy(
                <K extends IReflect.Key<IModel.State<M>>>(
                    target: {
                        [K in IReflect.Key<IModel.State<M>>]: {
                            bind: any,
                            unbind: any 
                        }
                    }, key: K
                ) => {
                    return {
                        bind: this.$bindModifier.bind(this, key),
                        unbind: this.$unbindModifier.bind(this, key)
                    };
                }
            )
        };

        /** 初始化状态 */
        this.$originState = new Proxy(config.originState, {
            set: (origin, key: IReflect.Key<IModel.State<M>>, value) => {
                origin[key] = value;
                this.updateState(key);
                return true;
            }
        });
        this.$currentState = { 
            ...this.$originState
        };

        /** 树形结构 */
        this.$childList = [];
        this.$childDict = new Proxy({} as IModel.ChildDict<M>, {
            set: (origin, key: IReflect.Key<IModel.ChildDefDict<M>>, value: Model) => {
                origin[key] = value as any;
                value.$bindParent(this as any);
                if (this.$status === ModelStatus.ACTIVATED) {
                    value.$activate();
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
        console.log(this.constructor.name, 'bind');
        /** 如果父节点从属于根节点，则触发根节点挂载 */
        if (
            this.$parent === this.app ||
            this.$parent?.status === ModelStatus.MOUNTED ||
            this.$parent?.status === ModelStatus.ACTIVATED
        ) {
            this.$mountRoot();
        }
        this.$status = ModelStatus.BINDED;
    }

    /** 挂载根节点 */
    public $mountRoot() {
        this.$status = ModelStatus.MOUNTING;
        console.log(this.constructor.name, 'mount');
        /** 注册 */
        this.app.referenceService.addRefer(this);
        /** 初始化依赖关系 */
        for (const key in this.$config.listenedIdDict) {
            if (this.$config.listenedIdDict) {
                const listenedList = this.$config.listenedIdDict[key] || [];
                listenedList.forEach(id => {
                    const model = this.app.referenceService.referDict[id];
                    if (model) {
                        model.$bindListener(key, this);
                    }
                });
            }
        }
        for (const key in this.$config.listenerIdDict) {
            if (this.$config.listenerIdDict) {
                const listenerList = this.$config.listenerIdDict[key] || [];
                listenerList.forEach(id => {
                    const model: any = this.app.referenceService.referDict[id];
                    if (model) {
                        this.$bindListener(key, model);
                    }
                });
            }
        }
        for (const key in this.$config.observedIdDict) {
            if (this.$config.observedIdDict) {
                const observerList = this.$config.observedIdDict[key] || [];
                observerList.forEach(id => {
                    const model = this.app.referenceService.referDict[id];
                    if (model) {
                        model.$bindObserver(key, this);
                    }
                });
            }
        }
        for (const key in this.$config.observerIdDict) {
            if (this.$config.observerIdDict) {
                const observerList = this.$config.observerIdDict[key] || [];
                observerList.forEach(id => {
                    const model: any = this.app.referenceService.referDict[id];
                    if (model) {
                        this.$bindObserver(key, model);
                    }
                });
            }
        }
        for (const key in this.$config.modifiedIdDict) {
            if (this.$config.modifiedIdDict) {
                const modifierList = this.$config.modifiedIdDict[key] || [];
                modifierList.forEach(id => {
                    const model = this.app.referenceService.referDict[id];
                    if (model) {
                        model.$bindModifier(key, this);
                    }
                });
            }
        }
        for (const key in this.$config.modifierIdDict) {
            if (this.$config.modifierIdDict) {
                const modifierList = this.$config.modifierIdDict[key] || [];
                modifierList.forEach(id => {
                    const model: any = this.app.referenceService.referDict[id];
                    if (model) {
                        this.$bindModifier(key, model);
                    }
                });
            }
        }
        /** 遍历子节点 */
        for (const child of this.$childList) {
            child.$mountRoot();
        }
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$mountRoot();
        }
        this.$status = ModelStatus.MOUNTED;
    }

    /** 初始化 */
    public $activate() {
        this.$status = ModelStatus.ACTIVATING;
        console.log(this.constructor.name, 'activated');
        if (!this.$activated) {
            this.activate();
            this.$activated = true;
        }
        /** 遍历 */
        this.$childList.forEach(child => {
            child.$activate();
        });
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$activate();
        }
        this.$status = ModelStatus.ACTIVATED;
    }

    public activate() {}

    /** 添加子节点 */
    protected $appendChild(target: IReflect.Iterator<IModel.ChildList<M>>) {
        this.$childList.push(target);
        target.$bindParent(this); 
        if (this.status === ModelStatus.ACTIVATED) {
            target.$activate();
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

    public $destroy() {
        this.app.referenceService.removeRefer(this);
        this.$childList.forEach(child => {
            child.$destroy();
        });
        for (const key in this.$childDict) {
            const child: Model = this.childDict[key];
            child.$destroy();
        }
        if (this.$parent instanceof Model) {
            this.$parent.$removeChild(this as any);
        }
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
        this.$emitModifier(key, event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            if (this.$status === ModelStatus.ACTIVATED) {
                this.$emitObserver(key, event);
                this.$setState();
            }
        }
    }
    
    public serializeIdDict<T extends Record<IBase.Key, Model[]>>(target: T) {
        const result = {} as Record<keyof T, string[]>;
        for (const key in target) {
            result[key] = target[key].map(model => {
                return model.id;
            });
        }
        return result;
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

        const listenedIdDict = {} as any;
        for (const key in this.$listenedDict) {
            const listenedList = this.$listenedDict[key];
            listenedIdDict[key] = listenedList.map(model => {
                return model.id;
            });
        }

        return {
            id: this.id,
            code: this.code,
            rule: this.rule,
            originState: this.$originState,
            childBundleDict,
            childBundleList,
            listenedIdDict: this.serializeIdDict(this.$listenedDict),
            listenerIdDict: this.serializeIdDict(this.$listenerDict),
            observedIdDict: this.serializeIdDict(this.$observedDict),
            observerIdDict: this.serializeIdDict(this.$observerDict),
            modifiedIdDict: this.serializeIdDict(this.$modifiedDict),
            modifierIdDict: this.serializeIdDict(this.$modifierDict),
            activated: true
        };
    }

    
    private $emitListener<
        K extends IReflect.Key<IModel.EventDict<M>>
    >(
        key: K,
        event: IModel.EventDict<M>[K]
    ) {
        const listenerList = this.$listenerDict[key];
        listenerList.forEach(model => {
            model.$eventHandlerDict.listener[key].call(model, event);
        });
    }

    private $emitObserver<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        event: IEvent.StateUpdateDone<M, K>
    ) {
        const observerList = this.$observerDict[key];
        observerList.forEach((model: IModel.Observer<Record<K, M>>) => {
            model.$eventHandlerDict.observer[key].call(model, event);
        });
    }

    private $emitModifier<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        event: IEvent.StateUpdateBefore<M, K>
    ) {
        const modifierList = this.$modifierDict[key];
        modifierList.forEach(model => {
            model.$eventHandlerDict.modifier[key].call(model, event);
        });
    }

    private $bindListener<
        K extends IReflect.Key<IModel.EventDict<M>>
    >(
        key: K,
        target: IModel.Listener<Record<K, M>>
    ) {
        target.$listenedDict[key].push(this);
        this.$listenerDict[key].push(target);
    }

    private $unbindListener<
        K extends IReflect.Key<IModel.EventDict<M>>
    >(
        key: K,
        handler: IModel.Listener<Record<K, M>>                                       
    ) { 
        const handlerIndex = handler.$listenedDict[key].indexOf(this);
        const emitterIndex = this.$listenerDict[key].indexOf(handler);
        if (handlerIndex < 0 || emitterIndex < 0) {
            throw new Error();
        }
        handler.$listenedDict[key].splice(handlerIndex, 1);
        this.$listenerDict[key].splice(emitterIndex, 1);
    }

    private $bindObserver<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        target: IModel.Observer<Record<K, M>>
    ) {
        target.$observedDict[key].push(this);
        this.$observerDict[key].push(target);
    }

    private $unbindObserver<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        handler: IModel.Observer<Record<K, M>>
    ) {
        const handlerIndex = handler.$observedDict[key].indexOf(this);
        const observerIndex = this.$observerDict[key].indexOf(handler);
        if (handlerIndex < 0 || observerIndex < 0) {
            throw new Error();
        }
        handler.$observedDict[key].splice(handlerIndex, 1);
        this.$observerDict[key].splice(observerIndex, 1);
    }

    private $bindModifier<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        target: IModel.Modifier<Record<K, M>>
    ) {
        target.$modifiedDict[key].push(this);
        this.$modifierDict[key].push(target);
    }

    private $unbindModifier<
        K extends IReflect.Key<IModel.State<M>>
    >(
        key: K,
        handler: IModel.Modifier<Record<K, M>>
    ) {
        const handlerIndex = handler.$modifiedDict[key].indexOf(this);
        const modifierIndex = this.$modifierDict[key].indexOf(handler);
        if (handlerIndex < 0 || modifierIndex < 0) {
            throw new Error();
        }
        handler.$modifiedDict[key].splice(handlerIndex, 1);
        this.$modifierDict[key].splice(modifierIndex, 1);
    }
}