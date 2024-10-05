import { KeyOf } from ".";
import { ModelTmpl } from "./model-def";
import { ISignal } from "./signal";

// 事件处理器
export type IEffect<E = any> = 
    IEffect.Wrap<E> &
    Readonly<{
        signalList: ISignal[];
        effectWrap: IEffect.Wrap<any>;
        destroy: () => void;
    }>

export namespace IEffect {
    export type Wrap<E> = Readonly<{
        modelId: string;
        eventKey: string;
        handleEvent: (event: E) => void;
        bindSignal: (signal: ISignal.Wrap<E>) => void;
        unbindSignal: (signal: ISignal.Wrap<E>) => void;
    }>

    // 事件处理器字典
    export type Dict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.EffectDict<M>>]: 
            IEffect<ModelTmpl.EffectDict<M>[K]>
    }

    // 封装的事件处理器字典
    export type WrapDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.EffectDict<M>>]: 
            IEffect.Wrap<ModelTmpl.EffectDict<M>[K]>
    }
}
