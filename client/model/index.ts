import type { App } from "../app";
import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import { Effect } from "../utils/effect";
import { Signal, SafeSignal } from "../utils/signal";
import { BaseModelConfig, ModelConfig } from "../type/model/config";
import { ModelBundle } from "../type/model/bundle";
import { AutomicProxy } from "../utils/proxy/automic";
import { ReadonlyProxy } from "../utils/proxy/readonly";
import { ControlledArray, ControlledProxy } from "../utils/proxy/controlled";
import { ModelInfo } from "../type/model/inspector";

export namespace Model {
    export type ChildList<M extends ModelDef> = Array<
        Model<ModelDef.ChildList<M>[number]>
    >

    export type ChildDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            Model<ModelDef.ChildDict<M>[K]>
    }

    export type Parent<M extends ModelDef> = 
        ModelDef.Parent<M> extends ModelDef ?
            Model<ModelDef.Parent<M>> :
            undefined;
}


// 模型基类
export abstract class Model<
    D extends ModelDef = ModelDef,
> {
    public readonly app: App;
    public readonly parent: Model.Parent<D>;
    
    // 唯一标识符
    public readonly id: string;
    public readonly code: string;

    // 数据结构
    protected readonly _originState: ModelDef.State<D>;
    private readonly _actualState: ModelDef.State<D>;
    public readonly actualState: ModelDef.State<D>;

    // 依赖关系
    protected readonly _signalDict: Readonly<Signal.ModelDict<D>>;
    protected readonly _statePosterDict: Signal.StatePosterDict<D>;
    protected readonly _stateEditorDict: Signal.StateEditorDict<D>;

    public readonly signalDict: Readonly<SafeSignal.ModelDict<D>>;
    public readonly statePosterDict: SafeSignal.StatePosterDict<D>;
    public readonly stateEditorDict: SafeSignal.StateEditorDict<D>;

    public readonly testerDict: Record<string, () => unknown>;
    protected abstract readonly _effectDict: Readonly<Effect.ModelDict<D>>;
    public abstract readonly methodDict: Readonly<ModelDef.MethodDict<D>>;

    // 从属关系
    protected readonly _childDict: Model.ChildDict<D>;
    protected readonly _childList: Model.ChildList<D>;
    public readonly childDict: Readonly<Model.ChildDict<D>>;
    public readonly childList: Readonly<Model.ChildList<D>>;

    private readonly _setInfoList: Array<(data: ModelInfo<D>) => void>; 

    protected EffectDict(
        handleEventDict: {
            [K in KeyOf<ModelDef.EffectDict<D>>]: (
                signal: ModelDef.EffectDict<D>[K]
            ) => void | ModelDef.EffectDict<D>[K];
        }
    ): Effect.ModelDict<D> {
        return AutomicProxy(key => {
            return new Effect(
                this.app,
                handleEventDict[key].bind(this),
                this._resetInfo.bind(this)
            );
        });
    }

    constructor(config: BaseModelConfig<D>) {
        this.testerDict = {};
        this._setInfoList = [];

        this.app = config.app;
        this.code = config.code; 
        this.parent = config.parent;

        this.id = config.id || this.app.referenceService.ticket;
        this.app.referenceService.registerModel(this);

        this._originState = ControlledProxy(
            config.state,
            this._updateState.bind(this)
        );
        
        this._actualState = { ...this._originState };
        this.actualState = ReadonlyProxy(this._actualState);

        this._signalDict = AutomicProxy(() => new Signal(
            this.app, 
            this._resetInfo.bind(this)
        ));
        this._statePosterDict = AutomicProxy(() => new Signal(
            this.app, 
            this._resetInfo.bind(this)
        ));
        this._stateEditorDict = AutomicProxy(key => new Signal(
            this.app,
            this._updateState.bind(this, key)
        ));

        this.signalDict = AutomicProxy(key => this._signalDict[key].safeSignal);
        this.statePosterDict = AutomicProxy(key => this._statePosterDict[key].safeSignal);
        this.stateEditorDict = AutomicProxy(key => this._stateEditorDict[key].safeSignal);

        this._childDict = ControlledProxy(
            config.childDict.format(this._unserialize.bind(this)),
            this._handleChildUpdate.bind(this)
        );
        this._childList = ControlledArray(
            config.childList?.map(this._unserialize.bind(this)),
            this._handleChildUpdate.bind(this, undefined)
        );

        this.childDict = ReadonlyProxy(this._childDict);
        this.childList = ReadonlyProxy(this._childList);

        if (this.parent === undefined) {
            this.app.root = this;
            this._activeAll();
        }
    }

    // 更新状态
    private _updateState(
        key: KeyOf<ModelDef.State<D>>
    ) {
        const prev = this._actualState[key];
        const current = this._originState[key];
        const signal = {
            target: this,
            prev: current,
            next: current
        };
        const result = this._stateEditorDict[key].emitSignal(signal);
        if (!result) throw new Error();
        const next = result.next;
        if (prev !== next) {
            this._actualState[key] = next;
            this._statePosterDict[key].emitSignal(signal);
        }
        this._resetInfo();
    }

    // 序列化对象
    public get bundle(): ModelBundle<D> {
        return {
            id: this.id,
            code: this.code,
            state: this._originState,
            childDict: this._childDict.format(child => child.bundle),
            childList: this._childList.map(child => child.bundle)
        };
    }

    // 初始化对象
    public get config(): ModelConfig<D> {
        return {
            ...this.bundle,
            id: undefined
        };
    }

    // 启用模型
    protected _active() {}

    // 析构模型
    protected _destroy() {}

    // 遍历启用模型
    private _activeAll() {
        this._active();
        for (const child of this._childList) child._activeAll();
        for (const child of Object.values(this._childDict)) child._activeAll();
    }

    // 遍历析构模型
    private _destroyAll() {
        for (const child of this._childList) child._destroyAll();
        for (const child of Object.values(this._childDict)) child._destroyAll();
        for (const signal of Object.values(this._signalDict)) signal.destroy();
        for (const signal of Object.values(this._statePosterDict)) signal.destroy();
        for (const signal of Object.values(this._stateEditorDict)) signal.destroy();
        for (const effect of Object.values(this._effectDict)) effect.destroy();
        this.app.referenceService.unregisterModel(this);
        this._destroy();
    }

    // 初始化子模型
    protected _unserialize<M extends ModelDef>(
        config: ModelConfig<M>
    ): Model<M> {
        return this.app.factoryService.unserialize({
            ...config,
            parent: this,
            app: this.app
        });
    }

    // 监听子模型变更
    private _handleChildUpdate(
        key: unknown,
        value: Model,
        isRemove?: boolean
    ) {
        if (isRemove) value._destroyAll();
        else value._activeAll();
        this._resetInfo();
    }
    
    // 重置调试器
    private _resetInfo() {
        for (const setInfo of this._setInfoList) {
            setInfo({
                childDict: this._childDict,
                childList: this._childList,
                signalDict: this._signalDict,
                statePosterDict: this._statePosterDict,
                stateEditorDict: this._stateEditorDict,
                effectDict: this._effectDict,
                state: this.actualState
            });
        }
    }

    // 注册调试器
    public useInfo(setInfo: (data: ModelInfo<D>) => void) {
        this._setInfoList.push(setInfo);
        this._resetInfo();
        return () => {
            const index = this._setInfoList.indexOf(setInfo);
            if (index < 0) throw new Error();
            this._setInfoList.splice(index, 1);
        };
    }

}

