import { Model } from ".";
import { KeyOf, ValueOf } from "../configs";
import { BaseModelConfig, PureModelConfig } from "../configs/model";
import { ModelDef } from "../configs/model-def";
import type { ModelRegstry } from "../configs/model-registry";
import { ModifySafeEventDict, SafeEventDict, UpdateSafeEventDict } from "../utils/event";
import { initAutomicProxy, initReadonlyProxy } from "../utils/proxy";

export type SpecModelDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ChildDict<M>>]: 
        InstanceType<ModelRegstry[ModelDef.Code<ModelDef.ChildDict<M>[K]>]>
}
export type SpecModelList<M extends ModelDef> = 
    Array<InstanceType<ModelRegstry[ModelDef.Code<ValueOf<ModelDef.ChildList<M>>>]>>
    

export abstract class SpecModel<
    M extends ModelDef = ModelDef
> extends Model<M> {
    public readonly childDict: SpecModelDict<M>;
    public readonly childList: SpecModelList<M>;
    public readonly eventDict: SafeEventDict<M>;
    public readonly updateEventDict: UpdateSafeEventDict<M>;
    public readonly modifyEventDict: ModifySafeEventDict<M>;

    constructor(config: BaseModelConfig<M>) {
        super(config);
        this.childDict = initReadonlyProxy<any>(this._childDict);
        this.childList = initReadonlyProxy<any>(this._childList);
        this.eventDict = initAutomicProxy(key => this._eventDict[key].safeEvent);
        this.updateEventDict = initAutomicProxy(key => this._updateEventDict[key].safeEvent);
        this.modifyEventDict = initAutomicProxy(key => this._modifyEventDict[key].safeEvent);
    }

    protected readonly _unserialize = <
        C extends ModelDef.Code<M>,
        M extends ModelDef
    >(
        config: PureModelConfig<M> & { code: C }
    ): InstanceType<ModelRegstry[C]> => {
        return this.app.factoryService.unserialize({
            ...config,
            parent: this,
            app: this.app
        }) as InstanceType<ModelRegstry[ModelDef.Code<M>]>;
    };
}