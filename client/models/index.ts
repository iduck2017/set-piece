import { KeyOf } from "../type";
import { ModelDef } from "../type/model-def";
import { initAutomicProxy, initReadonlyProxy } from "../utils/proxy";
import { ModelState } from "../debug";
import { React, ReactDict } from "../utils/react";
import { 
    Event,
    EventDict, 
    ModifyEventDict,
    UpdateEventDict 
} from "../utils/event";
import { 
    BaseModelConfig, 
    ModelBundle, 
    ModelBundleDict, 
    ModelDict, 
    ModelList, 
    PureModelConfig 
} from "../type/model";
import type { App } from "../app";
import { ModelCode } from "../type/model-code";


// 模型层节点
export abstract class Model<
    M extends ModelDef = ModelDef
> {
    // 外部指针
    public readonly app: App;
    public readonly parent: ModelDef.Parent<M>;
    
    // 唯一标识符
    public readonly id: string;
    public readonly code: ModelCode;

    // 数据结构
    protected readonly _originInfo: ModelDef.Info<M>;
    private readonly _actualInfo: ModelDef.Info<M>;
    public readonly actualInfo: ModelDef.Info<M>;

    // 事件依赖关系
    protected abstract readonly _reactDict: ReactDict<M>;
    protected readonly _eventDict: EventDict<M>;
    protected readonly _updateEventDict: UpdateEventDict<M>;
    protected readonly _modifyEventDict: ModifyEventDict<M>;

    // 节点从属关系
    protected readonly _childDict: ModelDict<M>;
    protected readonly _childList: ModelList<M>;

    // 调试器相关
    public apiDict: Record<string, () => void>;
    private readonly _setterList: Array<(data: ModelState<M>) => void>;

    // 初始化
    private _isActived?: boolean;

    public readonly _getState = (): ModelState<M> => {
        return {
            childDict: this._childDict,
            childList: this._childList,
            eventDict: this._eventDict,
            updateEventDict: this._updateEventDict,
            modifyEventDict: this._modifyEventDict,
            reactDict: this._reactDict,
            info: this.actualInfo
        };
    };

    public readonly _useState = (setter: (data: ModelState<M>) => void) => {
        this._setterList.push(setter);
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
            ) => void;
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
        this._eventDict = initAutomicProxy(
            (key) => {
                console.log(this.constructor.name, key);
                return new Event(
                    this.app,
                    this._setState
                );
            }
        );
        this._updateEventDict = initAutomicProxy(
            () => new Event(
                this.app,
                this._setState
            )
        );
        this._modifyEventDict = initAutomicProxy(
            key => new Event(
                this.app, 
                () => {
                    this._setState();
                    this._updateInfo(key);
                }
            )
        );

        // 初始化节点从属关系
        const childDict = {} as ModelDict<M>;
        Object.keys(config.childDict).forEach((
            key: KeyOf<ModelDict<M>>
        ) => {
            if (!config.childDict[key]) return;
            childDict[key] = this.app.factoryService.unserialize({
                ...config.childDict[key],
                parent: this,
                app: this.app
            });    
        });
        this._childDict = new Proxy(childDict, {
            set: <K extends KeyOf<ModelDict<M>>>(
                target: ModelDict<M>, 
                key: K, 
                value: ModelDict<M>[K]
            ) => {
                target[key] = value;
                value.activate();
                this._setState();
                return true;
            },
            deleteProperty: (target, key: KeyOf<ModelDict<M>>) => {
                const value = target[key];
                value._destroy();
                delete target[key];
                this._setState();
                return true;
            }
        });

        const childList = (config.childList || []).map(config => (
            this.app.factoryService.unserialize({
                ...config,
                parent: this,
                app: this.app
            })
        ));
        this._childList = new Proxy(childList, {
            set: (target, key: KeyOf<ModelList<M>>, value) => {
                target[key] = value;
                if (typeof key !== 'symbol' && !isNaN(Number(key))) {
                    const model: Model = value;
                    model.activate();
                    this._setState();
                }
                return true;
            },
            deleteProperty: (target, key: KeyOf<ModelList<M>>) => {
                const value = target[key];
                if (value instanceof Model) {
                    const model: Model = value;
                    model._destroy();
                    this._setState();
                }
                delete target[key];
                target.length --;
                return true;
            }
        });

        // 初始化调试器
        this.apiDict = {};
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
        const childDict = {} as ModelBundleDict<M>;
        Object.keys(this._childDict).forEach((
            key: KeyOf<ModelDict<M>>
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
    protected readonly _activate = () => {};
    public readonly activate = () => {
        if (this._isActived) throw new Error();
        this._activate();
        for (const child of this._childList) {
            child.activate();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child.activate();
        }
        this._isActived = true;
    };

    // 执行析构函数
    public readonly destroy = () => {};
    private readonly _destroy = () => {
        for (const child of this._childList) {
            child._destroy();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._destroy();
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

}

