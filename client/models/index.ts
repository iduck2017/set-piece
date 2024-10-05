import { App } from "../app";
import { KeyOf, Optional } from "../type";
import { ModelDef } from "../type/model-def";
import { IEffect } from "../type/effect";
import { ISignal } from "../type/signal";
import { IModel } from "../type/model";
import { initAutomicProxy, initReadonlyProxy } from "../utils/proxy";
import { ModelCode } from "../services/factory";
import { ModelState } from "../debug";

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
    private readonly _presetInfo?: Partial<ModelDef.StableInfo<M>>;
    protected readonly _stableInfo: ModelDef.StableInfo<M>;
    protected readonly _labileInfo: ModelDef.LabileInfo<M>;
    
    private readonly _info: ModelDef.Info<M>;
    public readonly info: ModelDef.Info<M>;

    // 事件依赖关系
    protected readonly _effectDict: IEffect.Dict<M>;
    protected readonly _signalDict: ISignal.Dict<M>;

    public readonly effectDict: IEffect.WrapDict<M>;
    public readonly signalDict: ISignal.WrapDict<M>;

    protected abstract readonly _handlerDict: {
        [K in KeyOf<ModelDef.EffectDict<M>>]: (
            event: ModelDef.EffectDict<M>[K]
        ) => void;
    }

    // 节点从属关系
    protected readonly _childDict: IModel.Dict<M>;
    protected readonly _childList: IModel.List<M>;

    public readonly childDict: IModel.Dict<M>;
    public readonly childList: IModel.List<M>;
    
    // 初始化状态
    private _isInited?: boolean;

    // 调试器相关
    public testcaseDict: Record<string, () => any>;
    public readonly setterList: Array<(data: ModelState<M>) => void>;

    public readonly getState = () => {
        return {
            childDict: this.childDict,
            childList: this.childList,
            signalDict: this._signalDict,
            effectDict: this._effectDict,
            info: this.info
        };
    };

    public readonly useState = (setter: (data: ModelState<M>) => void) => {
        this.setterList.push(setter);
        return () => {
            const index = this.setterList.indexOf(setter);
            if (index < 0) throw new Error();
            this.setterList.splice(index, 1);
        };
    };

    private readonly _setState = () => {
        for (const useModel of this.setterList) {
            useModel({
                childDict: this.childDict,
                childList: this.childList,
                signalDict: this._signalDict,
                effectDict: this._effectDict,
                info: this.info
            });
        }
    };

    constructor(config: IModel.BaseConfig<M>) {
        // 事件触发器
        class Signal<E> implements ISignal<E> {
            public readonly modelId: string;
            public readonly eventKey: string;
            public readonly stateKey?: string;
            public readonly effectList: IEffect<E>[] = [];
            public readonly signalWrap: ISignal.Wrap<E>;

            public readonly model: Model<M>;
            public readonly app: App;

            constructor(config: {
                infoList?: IEffect.Info[],
                model: Model<M>,
                eventKey: string,
                stateKey?: string
            }) {
                this.model = config.model;
                this.app = this.model.app; 
                this.modelId = config.model.id;
                this.eventKey = config.eventKey;
                this.stateKey = config.stateKey;
                this.signalWrap = {
                    modelId: this.modelId,
                    eventKey: this.eventKey,
                    stateKey: this.stateKey,
                    bindEffect: this.bindEffect.bind(this),
                    unbindEffect: this.unbindEffect.bind(this)
                };
            }

            // 查询事件处理器
            private readonly _findEffect = (
                effectInfo: IEffect.Info
            ): Optional<IEffect> => {
                const { modelId, eventKey } = effectInfo;
                const model = this.app.referenceService.findModel(modelId);
                if (!model) return;
                return model._effectDict[eventKey];
            };

            // 绑定事件接收器
            public readonly bindEffect = (
                effectInfo: IEffect.Info
            ) => {
                const effect = this._findEffect(effectInfo);
                if (!effect) throw new Error();
                this.effectList.push(effect);
                effect.signalList.push(this);
                if (this.eventKey === 'stateUpdateBefore') {
                    if (!this.stateKey) throw new Error();
                    this.model._updateInfo(this.stateKey);
                }
                this.model._setState();
            };

            // 解绑事件接收器
            public readonly unbindEffect = (
                effectInfo: IEffect.Info
            ) => {
                const effect = this._findEffect(effectInfo);
                if (!effect) throw new Error();
                const effectIndex = this.effectList.indexOf(effect);
                const signalIndex = effect.signalList.indexOf(this);
                if (effectIndex < 0) throw new Error();
                if (signalIndex < 0) throw new Error();
                this.effectList.splice(effectIndex, 1);
                effect.signalList.splice(signalIndex, 1);
                this.model._setState();
            };

            // 触发事件
            public readonly emitEvent = (event: E) => {
                for (const effect of this.effectList) {
                    const { modelId, eventKey } = effect;
                    const model = this.app.referenceService.findModel(modelId);
                    if (!model) throw new Error();
                    model._handlerDict[eventKey].call(model, event);
                }
            };

            // 序列化事件触发器
            public readonly unserialize = (): IEffect.Info[] => {
                return this.effectList.map(effect => ({
                    modelId: effect.modelId,
                    eventKey: effect.eventKey
                }));
            };

            public readonly destroy = () => {
                for (const effect of this.effectList) {
                    this.unbindEffect(effect);
                }
            };
        }

        // 事件处理器
        class Effect<E> implements IEffect<E>{
            public readonly modelId: string;
            public readonly eventKey: string;
            public readonly signalList: ISignal<E>[] = [];
            public readonly effectWrap: IEffect.Wrap<E>;

            public readonly app: App;
            public readonly model: Model<M>;

            constructor(config: {
                infoList?: ISignal.Info[],
                model: Model<M>,
                eventKey: string
            }) {
                this.model = config.model;
                this.modelId = config.model.id;
                this.app = this.model.app;
                this.eventKey = config.eventKey;
                this.effectWrap = {
                    modelId: this.modelId,
                    eventKey: this.eventKey,
                    bindSignal: this.bindSignal.bind(this),
                    unbindSignal: this.unbindSignal.bind(this)
                };
            }

            // 查询事件触发器
            private readonly _findSignal = (
                signalInfo: ISignal.Info
            ): Optional<ISignal> => {
                const { modelId, eventKey, stateKey } = signalInfo;
                const model = this.app.referenceService.findModel(modelId);
                if (!model) return;
                if (
                    eventKey ==='stateUpdateBefore' ||
                    eventKey ==='stateUpdateDone'
                ) {
                    if (!stateKey) throw new Error();
                    return model._signalDict[eventKey][stateKey];
                }
                return model._signalDict[eventKey];
            };

        
            // 绑定事件触发器
            public readonly bindSignal = (
                signalInfo: ISignal.Info
            ) => {
                const signal = this._findSignal(signalInfo);
                if (!signal) throw new Error();
                signal.bindEffect(this);
            };

            // 解绑事件触发器
            public readonly unbindSignal = (
                signalInfo: ISignal.Info
            ) => {
                const signal = this._findSignal(signalInfo);
                if (!signal) throw new Error();
                signal.unbindEffect(this);
            };

            // 序列化事件处理器
            public readonly unserialize = (): ISignal.Info[] => {
                return this.signalList.map(signal => ({
                    modelId: signal.modelId,
                    eventKey: signal.eventKey,
                    stateKey: signal.stateKey
                }));
            };

            public readonly destroy = () => {
                for (const signal of this.signalList) {
                    this.unbindSignal(signal);
                }
            };
        }

        // 初始化外部指针
        this.app = config.app;
        this.parent = config.parent;

        // 初始化唯一标识符
        this.id = config.id || this.app.referenceService.ticket;
        this.code = config.code;    

        // 初始化数据结构
        this._presetInfo = config.presetInfo;
        this._stableInfo = config.stableInfo;
        this._labileInfo = new Proxy(
            config.labileInfo, {
                set: (target, key: KeyOf<ModelDef.LabileInfo<M>>, value) => {
                    target[key] = value;
                    this._updateInfo(key);
                    return true;
                }
            }
        );

        this._info = {
            ...this._stableInfo,
            ...this._labileInfo
        };
        this.info = initReadonlyProxy(this._info);


        // 初始化事件依赖关系
        this._effectDict = initAutomicProxy(
            key => new Effect({
                infoList: config.effectDict?.[key],
                model: this,
                eventKey: key
            })
        );
        this._signalDict = initAutomicProxy<any>(
            key => new Signal({
                infoList: config.signalDict?.[key],
                model: this,
                eventKey: key
            }),
            {
                stateUpdateBefore: initAutomicProxy(
                    key => new Signal({
                        model: this,
                        eventKey: 'stateUpdateBefore',
                        stateKey: key,
                        infoList: config.signalDict?.stateUpdateBefore?.[key]
                    })
                ),
                stateUpdateDone: initAutomicProxy(
                    key => new Signal({
                        model: this,
                        eventKey: 'stateUpdateDone',
                        stateKey: key,
                        infoList: config.signalDict?.stateUpdateDone?.[key]
                    })
                )
            }
        );

        this.effectDict = initAutomicProxy(
            key => this._effectDict[key].effectWrap
        );
        this.signalDict = initAutomicProxy<any>(
            key => this._signalDict[key].signalWrap,
            {
                stateUpdateBefore: initAutomicProxy(key => (
                    this._signalDict.stateUpdateBefore[key].signalWrap
                )),
                stateUpdateDone: initAutomicProxy(key => (
                    this._signalDict.stateUpdateDone[key].signalWrap
                ))
            }
        );

        // 初始化节点从属关系
        const childDict = {} as any;
        Object.keys(config.childDict).forEach((
            key: KeyOf<IModel.Dict<M>>
        ) => {
            childDict[key] = this._unserialize(config.childDict[key]);
        });
        this._childDict = new Proxy(childDict, {
            set: <K extends KeyOf<IModel.Dict<M>>>(
                target: IModel.Dict<M>, 
                key: K, 
                value: IModel.Dict<M>[K]
            ) => {
                target[key] = value;
                value._initialize();
                this._setState();
                return true;
            },
            deleteProperty: (target, key: KeyOf<IModel.Dict<M>>) => {
                const value = target[key];
                value._destroy();
                delete target[key];
                this._setState();
                return true;
            }
        });

        const childList = (config.childList || []).map(config => (
            this._unserialize(config)
        ));
        this._childList = new Proxy(childList, {
            set: (target, key: KeyOf<IModel.List<M>>, value) => {
                target[key] = value;
                if (typeof key !== 'symbol' && !isNaN(Number(key))) {
                    const model: Model = value;
                    model._initialize();
                    this._setState();
                }
                return true;
            },
            deleteProperty: (target, key: KeyOf<IModel.List<M>>) => {
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

        this.childDict = initReadonlyProxy(this._childDict);
        this.childList = initReadonlyProxy(this._childList);

        // 初始化调试器
        this.testcaseDict = {};
        this.setterList = [];

        // 初始化根节点业务逻辑
        this._isInited = config.isInited;
        if (this.parent instanceof App) {
            setTimeout(() => {
                this._initialize();
            });
        }
    }

    // 更新状态
    private readonly _updateInfo = (
        key: KeyOf<ModelDef.StableInfo<M> & ModelDef.LabileInfo<M>>
    ) => {
        const originInfo = {
            ...this._stableInfo,
            ...this._labileInfo
        };
        const prev = this._info[key];
        const current = originInfo[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this._signalDict.stateUpdateBefore[key].emitEvent(event);
        const next = event.next;
        if (prev !== next) {
            this._info[key] = next;
            this._signalDict.stateUpdateDone[key].emitEvent(event);
            this._setState();
        }
    };

    // 生成反序列化节点
    protected readonly _unserialize = <C extends ModelDef>(
        config: IModel.RawConfig<C>
    ): IModel.Instance<C> => {
        return this.app.factoryService.unserialize({
            ...config,
            parent: this as any,
            app: this.app
        });
    };

    // 序列化模型层节点
    public readonly serialize = (): IModel.Bundle<M> => {

        // 序列化事件触发器/处理器字典
        // 序列化从属节点字典/列表
        const signalDict = {} as any;
        const effectDict = {} as any;
        const childDict = {} as any;
        const childList = [] as any;
        
        for (const key in this._effectDict) {
            const effect = this._effectDict[key];
            effectDict[key] = effect.unserialize();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            childDict[key] = child.serialize();
        }
        for (const child of this._childList) {
            childList.push(child.serialize());
        }
        for (const key in this._signalDict) {
            if (
                key === 'stateUpdateBefore' ||
                key === 'stateUpdateDone'
            ) {
                signalDict[key] = {};
                for (const stateKey in this._signalDict[key]) {
                    const signal = this._signalDict[key][stateKey];
                    signalDict[key][stateKey] = signal.unserialize();
                }
            } else {
                const signal = this._signalDict[key];
                signalDict[key] = signal.unserialize();
            }
        }

        // 返回节点序列化结果
        return {
            id: this.id,
            code: this.code,
            presetInfo: this._presetInfo,
            labileInfo: this._labileInfo,
            childDict,
            childList,
            signalDict,
            effectDict,
            isInited: true
        };
    };

    // 执行初始化函数
    public readonly initialize = () => {};
    private readonly _initialize = () => {
        if (!this._isInited) {
            console.log('model initialize', this.constructor.name);
            this.initialize();
            this._isInited = true;
        }
        for (const child of this._childList) {
            child._initialize();
        }
        for (const key in this._childDict) {
            const child = this._childDict[key];
            child._initialize();
        }
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
        for (const key in this._effectDict) {
            const effect = this._effectDict[key];
            effect.destroy();
        }
        for (const key in this._signalDict) {
            const signal = this._signalDict[key];
            signal.destroy();
        }
        this.app.referenceService.unregisterModel(this);
        this._destroy();
    };

}
