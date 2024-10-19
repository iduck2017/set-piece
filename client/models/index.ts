import { KeyOf, ValueOf } from "../type";
import { ModelDef } from "../type/model/define";
import { initAutomicProxy, initReadonlyProxy } from "../utils/proxy";
import type { ModelState } from "../debug";
import { React, ReactDict } from "../utils/react";
import { 
    Event,
    EventDict, 
    ModifyEventDict,
    ModifySafeEventDict,
    SafeEventDict,
    UpdateEventDict, 
    UpdateSafeEventDict
} from "../utils/event";
import { 
    BaseModelConfig, 
    ModelConfig
} from "../type/model/config";
import type { App } from "../app";
import { ModelBundle } from "../type/model/bundle";

export namespace Model {
    export type ChildList<M extends ModelDef> = Array<
        Model<ValueOf<ModelDef.ChildList<M>>>
    >

    export type ChildDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            Model<ModelDef.ChildDict<M>[K]>
    }
}


// 模型层节点
export abstract class Model<
    M extends ModelDef = ModelDef,
> {
    // 外部指针
    public readonly app: App;
    public readonly parent: ModelDef.Parent<M>;
    
    // 唯一标识符
    public readonly id: string;
    public readonly code: string;

    // 数据结构
    protected readonly _originInfo: ModelDef.Info<M>;
    private readonly _actualInfo: ModelDef.Info<M>;
    public readonly actualInfo: ModelDef.Info<M>;

    // 事件依赖关系
    protected readonly _eventDict: EventDict<M>;
    protected readonly _updateEventDict: UpdateEventDict<M>;
    protected readonly _modifyEventDict: ModifyEventDict<M>;
    public readonly eventDict: SafeEventDict<M>;
    public readonly updateEventDict: UpdateSafeEventDict<M>;
    public readonly modifyEventDict: ModifySafeEventDict<M>;
    
    protected abstract readonly _reactDict: ReactDict<M>;
    public abstract readonly intf: Readonly<ModelDef.Intf<M>>;

    // 节点从属关系
    protected readonly _childDict: Model.ChildDict<M>;
    protected readonly _childList: Model.ChildList<M>;
    public readonly childDict: Readonly<Model.ChildDict<M>>;
    public readonly childList: Readonly<Model.ChildList<M>>;

    // 调试器相关
    private readonly _setterList: Array<(data: ModelState<M>) => void>;

    // 初始化
    private _isActived?: boolean;

    public readonly _useState = (setter: (data: ModelState<M>) => void) => {
        this._setterList.push(setter);
        this._setState();
        return () => {
            const index = this._setterList.indexOf(setter);
            if (index < 0) throw new Error();
            this._setterList.splice(index, 1);
        };
    };

    private readonly _setState = () => {
        for (const useModel of this._setterList) {
            useModel({
                childDict: this._childDict,
                childList: this._childList,
                eventDict: this._eventDict,
                updateEventDict: this._updateEventDict,
                modifyEventDict: this._modifyEventDict,
                reactDict: this._reactDict,
                info: this.actualInfo
            });
        }
    };

    protected readonly _initReactDict = (
        callback: {
            [K in KeyOf<ModelDef.ReactDict<M>>]: (
                event: ModelDef.ReactDict<M>[K]
            ) => void | ModelDef.ReactDict<M>[K];
        }
    ): ReactDict<M> => {
        return initAutomicProxy(key => {
            return new React(
                this.app,
                callback[key].bind(this),
                this._setState
            );
        });
    };

    protected readonly _initChildList = (
        config: ModelConfig.ChildList<M>
    ): Model.ChildList<M> => {
        const childList = config.map(config => (
            this.app.factoryService.unserialize({
                ...config,
                parent: this,
                app: this.app
            })
        ));
        childList.splice = (index, removeCount = 1, ...addList: Model[]) => {
            const removeList = childList.slice(index, index + removeCount);
            const result = Array.prototype.splice.call(
                childList, 
                index,
                removeCount,
                ...addList
            );
            addList.forEach(item => {
                item._recRecover();
                this._setState();
            });
            removeList.forEach(item => {
                item._recDestroy();
                this._setState();
            });
            return result;
        };
        childList.push = (...items) => {
            const result = Array.prototype.push.apply(
                childList, 
                items
            );
            items.forEach(item => {
                item._recRecover();
                this._setState();
            });
            return result;
        };
        childList.pop = () => {
            const item = childList.pop();
            if (item) {
                item._recDestroy();
                this._setState();
            }
            return item;
        };
        childList.shift = () => {
            const item = childList.shift();
            if (item) {
                item._recDestroy();
                this._setState();
            }
            return item;
        };
        childList.unshift = (...items) => {
            const result = Array.prototype.unshift.apply(
                childList, 
                items
            );
            items.forEach(item => {
                item._recRecover();
                this._setState();
            });
            return result;
        };
        return childList;
    };
    
    constructor(config: BaseModelConfig<M>) {

        // 初始化外部指针
        this.app = config.app;
        this.parent = config.parent;

        // 初始化唯一标识符
        this.id = config.id || this.app.referenceService.ticket;
        this.code = config.code;    
        this.app.referenceService.registerModel(this);

        // 初始化数据结构
        this._originInfo = new Proxy(
            config.info, {
                set: (target, key: KeyOf<ModelDef.Info<M>>, value) => {
                    target[key] = value;
                    this._updateInfo(key);
                    return true;
                }
            }
        );
        this._actualInfo = { ...this._originInfo };
        this.actualInfo = initReadonlyProxy(this._actualInfo);


        // 初始化事件依赖关系
        this._eventDict = initAutomicProxy(() => new Event(
            this.app,
            this._setState
        ));
        this._updateEventDict = initAutomicProxy(() => new Event(
            this.app,
            this._setState
        ));
        this._modifyEventDict = initAutomicProxy(key => new Event(
            this.app, 
            () => {
                this._setState();
                this._updateInfo(key);
            }
        ));
        this.eventDict = initAutomicProxy(key => this._eventDict[key].safeEvent);
        this.updateEventDict = initAutomicProxy(key => this._updateEventDict[key].safeEvent);
        this.modifyEventDict = initAutomicProxy(key => this._modifyEventDict[key].safeEvent);

        // 初始化节点从属关系
        const childDict = {} as Model.ChildDict<M>;
        Object.keys(config.childDict).forEach((
            key: KeyOf<Model.ChildDict<M>>
        ) => {
            if (!config.childDict[key]) return;
            childDict[key] = 
                this.app.factoryService.unserialize({
                    ...config.childDict[key],
                    parent: this,
                    app: this.app
                });    
        });
        this._childDict = new Proxy(childDict, {
            set: <K extends KeyOf<Model.ChildDict<M>>>(
                target: Model.ChildDict<M>, 
                key: K, 
                value: Model.ChildDict<M>[K]
            ) => {
                target[key] = value;
                value._recRecover();
                this._setState();
                return true;
            },
            deleteProperty: (target, key: KeyOf<Model.ChildDict<M>>) => {
                const value = target[key];
                value._recDestroy();
                delete target[key];
                this._setState();
                return true;
            }
        });
        this._childList = this._initChildList(config.childList || []);

        this.childDict = initReadonlyProxy(this._childDict);
        this.childList = initReadonlyProxy(this._childList);

        // 初始化调试器
        this._setterList = [];
    }

    // 更新状态
    private readonly _updateInfo = (
        key: KeyOf<ModelDef.Info<M>>
    ) => {
        const prev = this._actualInfo[key];
        const current = this._originInfo[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this._modifyEventDict[key].emitEvent(event);
        const next = event.next;
        if (prev !== next) {
            this._actualInfo[key] = next;
            this._updateEventDict[key].emitEvent(event);
            this._setState();
        }
    };


    // 序列化模型层节点
    public readonly serialize = (): ModelBundle<M> => {
        // 序列化事件触发器/处理器字典
        // 序列化从属节点字典/列表
        const childDict = {} as ModelBundle.ChildDict<M>;
        Object.keys(this._childDict).forEach((
            key: KeyOf<Model.ChildDict<M>>
        ) => {
            const child = this._childDict[key];
            childDict[key] = child.serialize();
        });

        // 返回节点序列化结果
        return {
            id: this.id,
            code: this.code,
            info: this._originInfo,
            childDict,
            childList: this._childList.map(child => (
                child.serialize()
            ))
        };
    };

    // 执行初始化函数
    protected readonly _recover = () => {};
    protected readonly _recRecover = () => {
        if (this._isActived) return;
        this._recover();
        for (const child of this._childList) {
            child._recRecover();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._recRecover();
        }
        this._isActived = true;
    };

    // 执行析构函数
    protected readonly _destroy = () => {};
    private readonly _recDestroy = () => {
        console.log('destroy', this.id);
        for (const child of this._childList) {
            child._recDestroy();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._recDestroy();
        }
        for (const key in this._reactDict) {
            const react = this._reactDict[key];
            react.destroy();
        }
        for (const key in this._eventDict) {
            const event = this._eventDict[key];
            event.destroy();
        }
        this.app.referenceService.unregisterModel(this);
        this._destroy();
    };

    protected readonly _unserialize = <M extends ModelDef>(
        config: ModelConfig<M>
    ): Model<M> => {
        return this.app.factoryService.unserialize({
            ...config,
            parent: this,
            app: this.app
        });
    };
}

