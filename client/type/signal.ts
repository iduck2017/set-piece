import { KeyOf, Override } from ".";
import { IEffect } from "./effect";
import { StateUpdateBefore, StateUpdateDone } from "./event";
import { ModelTmpl } from "./model-tmpl";

// 事件触发器
export type ISignal<E = any> = 
    ISignal.Safe<E> &
    Readonly<{
        effectList: IEffect<E>[];
        signalWrap: ISignal.Safe<E>;
        emitEvent: (event: E) => void;
        destroy: () => void;
    }>

export namespace ISignal {
    export type Safe<E> = Readonly<{
        modelId: string;
        eventKey: string;
        stateKey?: string;
        bindEffect: (effect: IEffect.Safe<E>) => void;
        unbindEffect: (effect: IEffect.Safe<E>) => void;
    }>

    // 事件触发器字典
    export type Dict<M extends ModelTmpl> = Override<{
        [K in KeyOf<ModelTmpl.EventDict<M>>]:
            ISignal<ModelTmpl.EventDict<M>[K]>;
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
    export type SafeDict<M extends ModelTmpl> = Override<{
        [K in KeyOf<ModelTmpl.EventDict<M>>]:
            ISignal.Safe<ModelTmpl.EventDict<M>[K]>;
    }, {
        stateUpdateBefore: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal.Safe<StateUpdateBefore<M, ModelTmpl.Info<M>[K]>>;
        }
        stateUpdateDone: {
            [K in KeyOf<ModelTmpl.Info<M>>]:
                ISignal.Safe<StateUpdateDone<M, ModelTmpl.Info<M>[K]>>;
        },
    }>
}
