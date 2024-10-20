import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
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
import { AutomicProxy } from "../utils/proxy/automic";
import { ReadonlyProxy } from "../utils/proxy/readonly";
import { ControlledArray, ControlledProxy } from "../utils/proxy/controlled";

export namespace Model {
    export type ChildList<M extends ModelDef> = Array<
        Model<ModelDef.ChildList<M>[number]>
    >

    export type ChildDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            Model<ModelDef.ChildDict<M>[K]>
    }
}


// 模型基类
export abstract class Model<
    M extends ModelDef = ModelDef,
> {
    public readonly app: App;
    public readonly parent: ModelDef.Parent<M>;
    
    // 唯一标识符
    public readonly id: string;
    public readonly code: string;

    // 数据结构
    protected readonly _originInfo: ModelDef.Info<M>;
    private readonly _actualInfo: ModelDef.Info<M>;
    public readonly actualInfo: ModelDef.Info<M>;

    // 依赖关系
    protected readonly _eventDict: EventDict<M>;
    protected readonly _updateEventDict: UpdateEventDict<M>;
    protected readonly _modifyEventDict: ModifyEventDict<M>;

    public readonly eventDict: SafeEventDict<M>;
    public readonly updateEventDict: UpdateSafeEventDict<M>;
    public readonly modifyEventDict: ModifySafeEventDict<M>;
    
    protected abstract readonly _reactDict: ReactDict<M>;
    public abstract readonly intf: Readonly<ModelDef.Intf<M>>;

    // 从属关系
    protected readonly _childDict: Model.ChildDict<M>;
    protected readonly _childList: Model.ChildList<M>;
    public readonly childDict: Readonly<Model.ChildDict<M>>;
    public readonly childList: Readonly<Model.ChildList<M>>;

    private _isActived?: boolean;

    // 调试器相关
    private readonly _useModelList: Array<(data: ModelState<M>) => void>;

    public _useState(setter: (data: ModelState<M>) => void) {
        this._useModelList.push(setter);
        this._setState();
        return () => {
            const index = this._useModelList.indexOf(setter);
            if (index < 0) throw new Error();
            this._useModelList.splice(index, 1);
        };
    }
    private _setState() {
        for (const useModel of this._useModelList) {
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
    }

    protected readonly _initReactDict = (
        callback: {
            [K in KeyOf<ModelDef.ReactDict<M>>]: (
                event: ModelDef.ReactDict<M>[K]
            ) => void | ModelDef.ReactDict<M>[K];
        }
    ): ReactDict<M> => {
        return AutomicProxy(key => {
            return new React(
                this.app,
                callback[key].bind(this),
                this._setState.bind(this)
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
        this._originInfo = ControlledProxy(
            config.info,
            this._updateInfo,
            this._updateInfo
        );
        this._actualInfo = { ...this._originInfo };
        this.actualInfo = ReadonlyProxy(this._actualInfo);

        // 初始化事件依赖关系
        this._eventDict = AutomicProxy(() => (
            new Event(this.app, this._setState.bind(this))
        ));
        this.eventDict = AutomicProxy(key => (
            this._eventDict[key].safeEvent
        ));

        this._updateEventDict = AutomicProxy(() => (
            new Event(this.app, this._setState.bind(this))
        ));
        this.updateEventDict = AutomicProxy(key => (
            this._updateEventDict[key].safeEvent
        ));

        this._modifyEventDict = AutomicProxy(key => (
            new Event(this.app, () => {
                this._setState.bind(this);
                this._updateInfo(key);
            })
        ));
        this.modifyEventDict = AutomicProxy(key => (
            this._modifyEventDict[key].safeEvent
        ));

        // 初始化节点从属关系
        this._childDict = ControlledProxy(
            config.childDict.format(this._unserialize),
            (key, model) => model._activeAll(),
            (key, model) => model._destroyAll(),
            this._setState.bind(this)
        );
        this._childList = ControlledArray(
            config.childList?.map(this._unserialize),
            value => value._activeAll(),
            value => value._destroyAll(),
            this._setState.bind(this)
        );

        this.childDict = ReadonlyProxy(this._childDict);
        this.childList = ReadonlyProxy(this._childList);


        // 初始化调试器
        this._useModelList = [];
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
        return {
            id: this.id,
            code: this.code,
            info: this._originInfo,
            childDict: this._childDict.format(child => child.serialize()),
            childList: this._childList.map(child => child.serialize())
        };
    };

    // 执行初始化函数
    protected readonly _active = () => {};
    protected readonly _activeAll = () => {
        if (this._isActived) return;
        this._active();
        for (const child of this._childList) {
            child._activeAll();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._activeAll();
        }
        this._isActived = true;
    };

    // 执行析构函数
    protected readonly _destroy = () => {};
    private readonly _destroyAll = () => {
        console.log('destroy', this.id);
        for (const child of this._childList) {
            child._destroyAll();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._destroyAll();
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

