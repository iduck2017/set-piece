import { KeyOf, Override } from ".";
import { IEffect } from "./effect";
import { StateUpdateBefore, StateUpdateDone } from "./event";
import { ModelDef } from "./model-def";

// 事件触发器
export type ISignal<E = any> = 
    ISignal.Wrap<E> &
    Readonly<{
        effectList: IEffect<E>[];
        signalWrap: ISignal.Wrap<E>;
        emitEvent: (event: E) => void;
        bindEffect: (effect: IEffect.Wrap<E>) => void;
        unbindEffect: (effect: IEffect.Wrap<E>) => void;
        unserialize: () => IEffect.Info[];
        destroy: () => void;
    }>

export namespace ISignal {
    export type Wrap<E> = 
        ISignal.Info &
        Readonly<{
            bindEffect: (effect: IEffect.Wrap<E>) => void;
            unbindEffect: (effect: IEffect.Wrap<E>) => void;
        }>

    export type Info = Readonly<{
        modelId: string;
        eventKey: string;
        stateKey?: string;
    }>

    // 事件触发器字典
    export type Dict<M extends ModelDef> = Override<{
        [K in KeyOf<ModelDef.SignalDict<M>>]:
            ISignal<ModelDef.SignalDict<M>[K]>;
    }, {
        stateUpdateBefore: {
            [K in KeyOf<ModelDef.Info<M>>]:
                ISignal<StateUpdateBefore<M, ModelDef.Info<M>[K]>>;
        }
        stateUpdateDone: {
            [K in KeyOf<ModelDef.Info<M>>]:
                ISignal<StateUpdateDone<M, ModelDef.Info<M>[K]>>;
        },
    }>

    // 受封装的事件触发器字典
    export type WrapDict<M extends ModelDef> = Override<{
        [K in KeyOf<ModelDef.SignalDict<M>>]:
            ISignal.Wrap<ModelDef.SignalDict<M>[K]>;
    }, {
        stateUpdateBefore: {
            [K in KeyOf<ModelDef.Info<M>>]:
                ISignal.Wrap<StateUpdateBefore<M, ModelDef.Info<M>[K]>>;
        }
        stateUpdateDone: {
            [K in KeyOf<ModelDef.Info<M>>]:
                ISignal.Wrap<StateUpdateDone<M, ModelDef.Info<M>[K]>>;
        },
    }>

    // 初始化参数字典
    export type ConfigDict<M extends ModelDef> = Override<{
        [K in KeyOf<ModelDef.SignalDict<M>>]?: IEffect.Info[];
    }, {
        stateUpdateBefore?: { [K in KeyOf<ModelDef.Info<M>>]?: IEffect.Info[]; }
        stateUpdateDone?: { [K in KeyOf<ModelDef.Info<M>>]?: IEffect.Info[]; }
    }>

}
