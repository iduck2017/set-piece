import { KeyOf } from ".";
import { ModelTmpl } from "./model-tmpl";
import { ISignal } from "./signal";

// 事件处理器
export type IEffect<E = any> = 
    IEffect.Safe<E> &
    Readonly<{
        signalList: ISignal[];
        effectWrap: IEffect.Safe<any>;
        destroy: () => void;
    }>

export namespace IEffect {
    export type Safe<E> = Readonly<{
        modelId: string;
        eventKey: string;
        handleEvent: (event: E) => void;
        bindSignal: (signal: ISignal.Safe<E>) => void;
        unbindSignal: (signal: ISignal.Safe<E>) => void;
    }>

    // 事件处理器字典
    export type Dict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.EffectDict<M>>]: 
            IEffect<ModelTmpl.EffectDict<M>[K]>
    }

    // 封装的事件处理器字典
    export type SafeDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.EffectDict<M>>]: 
            IEffect.Safe<ModelTmpl.EffectDict<M>[K]>
    }
}
