import { KeyOf } from ".";
import { ModelTmpl } from "./model-tmpl";
import type { SafeEvent } from "./event";
import { Model } from "../models";

// 事件处理器
export type ReactIntf<E = any> = Readonly<{
    model: Model;
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