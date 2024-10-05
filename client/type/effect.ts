import { KeyOf } from ".";
import { ModelDef } from "./model-def";
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
    export type Dict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.EffectDict<M>>]: 
            IEffect<ModelDef.EffectDict<M>[K]>
    }

    // 封装的事件处理器字典
    export type WrapDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.EffectDict<M>>]: 
            IEffect.Wrap<ModelDef.EffectDict<M>[K]>
    }
}
