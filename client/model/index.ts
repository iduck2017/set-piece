import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import type { ModelInfo } from "../debug";
import { Effect } from "../utils/effect";
import { 
    Signal,
    SafeSignal
} from "../utils/signal";
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
    
    protected abstract readonly _effectDict: Readonly<Effect.ModelDict<D>>;
    public abstract readonly methodDict: Readonly<ModelDef.MethodDict<D>>;

    // 从属关系
    protected readonly _childDict: Model.ChildDict<D>;
    protected readonly _childList: Model.ChildList<D>;
    public readonly childDict: Readonly<Model.ChildDict<D>>;
    public readonly childList: Readonly<Model.ChildList<D>>;

    // 调试器相关
    private readonly _useModelList: Array<(data: ModelInfo<D>) => void>;

    public _useState(setter: (data: ModelInfo<D>) => void) {
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
                signalDict: this._signalDict,
                statePosterDict: this._statePosterDict,
                stateEditorDict: this._stateEditorDict,
                effectDict: this._effectDict,
                state: this.actualState
            });
        }
    }

    protected readonly _initEffectDict = (
        callback: {
            [K in KeyOf<ModelDef.EffectDict<D>>]: (
                signal: ModelDef.EffectDict<D>[K]
            ) => void | ModelDef.EffectDict<D>[K];
        }
    ): Effect.ModelDict<D> => {
        return AutomicProxy(key => {
            return new Effect(
                this.app,
                callback[key].bind(this),
                this._setState.bind(this)
            );
        });
    };

    constructor(config: BaseModelConfig<D>) {
        // 初始化调试器
        this._useModelList = [];

        // 初始化外部指针
        this.app = config.app;
        this.parent = config.parent;

        // 初始化唯一标识符
        this.id = config.id || this.app.referenceService.ticket;
        this.code = config.code;    
        this.app.referenceService.registerModel(this);

        // 初始化数据结构
        this._originState = ControlledProxy(
            config.state,
            this._updateState,
            this._updateState
        );
        this._actualState = { ...this._originState };
        this.actualState = ReadonlyProxy(this._actualState);

        // 初始化事件依赖关系
        this._signalDict = AutomicProxy(() => (
            new Signal(this.app, this._setState.bind(this))
        ));

        this._statePosterDict = AutomicProxy(() => (
            new Signal(this.app, this._setState.bind(this))
        ));

        this._stateEditorDict = AutomicProxy(key => (
            new Signal(this.app, () => {
                this._setState.bind(this);
                this._updateState(key);
            })
        ));

        this.signalDict = AutomicProxy(key => this._signalDict[key].safeSignal);
        this.statePosterDict = AutomicProxy(key => this._statePosterDict[key].safeSignal);
        this.stateEditorDict = AutomicProxy(key => this._stateEditorDict[key].safeSignal);

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

        if (this.parent === undefined) {
            this.app.root = this;
        }
        this._activeAll();
    }

    // 更新状态
    private readonly _updateState = (
        key: KeyOf<ModelDef.State<D>>
    ) => {
        const prev = this._actualState[key];
        const current = this._originState[key];
        const signal = {
            target: this,
            prev: current,
            next: current
        };
        const result = this._stateEditorDict[key].emitSignal(signal);
        if (!result) return;
        const next = result.next;
        if (prev !== next) {
            this._actualState[key] = next;
            this._statePosterDict[key].emitSignal(signal);
            this._setState();
        }
    };


    // 序列化模型层节点
    public readonly serialize = (): ModelBundle<D> => {
        return {
            id: this.id,
            code: this.code,
            state: this._originState,
            childDict: this._childDict.format(child => child.serialize()),
            childList: this._childList.map(child => child.serialize())
        };
    };

    // 执行初始化函数
    protected _active() {}
    private _activeAll() {
        this._active();
        for (const child of this._childList) child._activeAll();
        for (const child of Object.values(this._childDict)) child._activeAll();
    }

    // 执行析构函数
    protected _destroy() {}
    private readonly _destroyAll = () => {
        for (const child of this._childList) child._destroyAll();
        for (const child of Object.values(this._childDict)) child._destroyAll();
        for (const signal of Object.values(this._signalDict)) signal.destroy();
        for (const signal of Object.values(this._statePosterDict)) signal.destroy();
        for (const signal of Object.values(this._stateEditorDict)) signal.destroy();
        for (const effect of Object.values(this._effectDict)) effect.destroy();
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

