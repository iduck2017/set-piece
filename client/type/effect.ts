import { KeyOf } from ".";
import { ModelDef } from "./model-def";
import { ISignal } from "./signal";

// 事件处理器
export type IEffect<E = any> = 
    IEffect.Wrap<E> &
    Readonly<{
        signalList: ISignal[];
        effectWrap: IEffect.Wrap<any>;
        unserialize: () => ISignal.Info[];
        destroy: () => void;
    }>

export namespace IEffect {
    export type Wrap<E> = 
        IEffect.Info &
        Readonly<{
            event?: E
            bindSignal: (signal: ISignal.Wrap<E>) => void;
            unbindSignal: (signal: ISignal.Wrap<E>) => void;
        }>

    export type Info = Readonly<{
        modelId: string;
        eventKey: string;
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
    
    // 初始化参数字典
    export type ConfigDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.EffectDict<M>>]?: ISignal.Info[]
    }
}
