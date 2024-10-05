import { KeyOf } from ".";
import { ModelTmpl } from "./model-tmpl";
import type { SafeEvent } from "./event";

// 事件处理器
export type ReactIntf<E = any> = Readonly<{
    modelId: string;
    eventKey: string;
    handleEvent: (event: E) => void;
    bindEvent: (event: SafeEvent<E>) => void;
    unbindEvent: (event: SafeEvent<E>) => void;
    destroy: () => void;
}>

export type ReactDict<M extends ModelTmpl> = {
    [K in KeyOf<ModelTmpl.ReactDict<M>>]: 
        ReactIntf<ModelTmpl.ReactDict<M>[K]>
}