import { KeyOf, Override } from ".";
import { ReactIntf } from "./react";
import { ModelTmpl } from "./model-tmpl";
import { Model } from "../models";

// 事件类型
export namespace EventType {
    export type StateUpdateBefore<
        M extends ModelTmpl, T
    > = {
        target: Model<M>,
        prev: T,
        next: T,
        canncel?: boolean
    }
    
    export type StateUpdateDone<
        M extends ModelTmpl, T
    > = {
        target: Model<M>,
        next: T,
        prev: T,
    }
}

// 事件触发器
export type EventIntf<E = any> = 
    SafeEvent<E> &
    Readonly<{
        reactList: ReactIntf<E>[];
        safeEvent: SafeEvent<E>;
        emitEvent: (event: E) => void;
        destroy: () => void;
    }>

const EVENT_SYMBOL = Symbol('eventSymbol');
export type SafeEvent<E = any> = Readonly<{
    modelId: string;
    eventKey: string;
    stateKey?: string;
    [EVENT_SYMBOL]?: E;
}>

export type EventDict<M extends ModelTmpl> = Override<{
    [K in KeyOf<ModelTmpl.EventDict<M>>]:
        EventIntf<ModelTmpl.EventDict<M>[K]>;
}, {
    stateUpdateBefore: {
        [K in KeyOf<ModelTmpl.Info<M>>]: EventIntf<
            EventType.StateUpdateBefore<M, ModelTmpl.Info<M>[K]>
        >;
    }
    stateUpdateDone: {
        [K in KeyOf<ModelTmpl.Info<M>>]: EventIntf<
            EventType.StateUpdateDone<M, ModelTmpl.Info<M>[K]>
        >;
    },
}>

export type SafeEventDict<M extends ModelTmpl> = Override<{
    [K in KeyOf<ModelTmpl.EventDict<M>>]:
        SafeEvent<ModelTmpl.EventDict<M>[K]>;
}, {
    stateUpdateBefore: {
        [K in KeyOf<ModelTmpl.Info<M>>]: SafeEvent<
            EventType.StateUpdateBefore<M, ModelTmpl.Info<M>[K]>
        >;
    }
    stateUpdateDone: {
        [K in KeyOf<ModelTmpl.Info<M>>]: SafeEvent<
            EventType.StateUpdateDone<M, ModelTmpl.Info<M>[K]>
        >;
    },
}>
