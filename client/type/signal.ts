import { KeyOf, Override } from ".";
import { IEffect } from "./effect";
import { StateUpdateBefore, StateUpdateDone } from "./event";
import { ModelTmpl } from "./model-def";

// 事件触发器
export type ISignal<E = any> = 
    ISignal.Wrap<E> &
    Readonly<{
        effectList: IEffect<E>[];
        signalWrap: ISignal.Wrap<E>;
        emitEvent: (event: E) => void;
        destroy: () => void;
    }>

export namespace ISignal {
    export type Wrap<E> = Readonly<{
        modelId: string;
        eventKey: string;
        stateKey?: string;
        bindEffect: (effect: IEffect<E>) => void;
        unbindEffect: (effect: IEffect<E>) => void;
    }>

    // 事件触发器字典
    export type Dict<M extends ModelTmpl> = Override<{
        [K in KeyOf<ModelTmpl.SignalDict<M>>]:
            ISignal<ModelTmpl.SignalDict<M>[K]>;
    }, {
        stateUpdateBefore: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal<StateUpdateBefore<M, ModelTmpl.Info<M>[K]>>;
        }
        stateUpdateDone: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal<StateUpdateDone<M, ModelTmpl.Info<M>[K]>>;
        },
    }>

    // 受封装的事件触发器字典
    export type WrapDict<M extends ModelTmpl> = Override<{
        [K in KeyOf<ModelTmpl.SignalDict<M>>]:
            ISignal.Wrap<ModelTmpl.SignalDict<M>[K]>;
    }, {
        stateUpdateBefore: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal.Wrap<StateUpdateBefore<M, ModelTmpl.Info<M>[K]>>;
        }
        stateUpdateDone: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal.Wrap<StateUpdateDone<M, ModelTmpl.Info<M>[K]>>;
        },
    }>
}
