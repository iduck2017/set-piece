import { KeyOf } from ".";
import { ModelTmpl } from "./model-tmpl";
import type { EventIntf, SafeEvent } from "./event";

// 事件处理器
export type ReactIntf<E = any> = 
    SafeReact<E> &
    Readonly<{
        eventList: EventIntf[];
        safeReact: SafeReact<E>;
        destroy: () => void;
    }>

export type SafeReact<E> = Readonly<{
    modelId: string;
    eventKey: string;
    handleEvent: (event: E) => void;
    bindEvent: (event: SafeEvent<E>) => void;
    unbindEvent: (event: SafeEvent<E>) => void;
}>

export type ReactDict<M extends ModelTmpl> = {
    [K in KeyOf<ModelTmpl.ReactDict<M>>]: 
        ReactIntf<ModelTmpl.ReactDict<M>[K]>
}

export type SafeReactDict<M extends ModelTmpl> = {
    [K in KeyOf<ModelTmpl.ReactDict<M>>]: 
        SafeReact<ModelTmpl.ReactDict<M>[K]>
}
