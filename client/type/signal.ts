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
}
