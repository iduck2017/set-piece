// import { Model } from ".";
// import { KeyOf, ValueOf } from "../types";
// import { BaseModelConfig, PureModelConfig } from "../types/model";
// import { ModelDef } from "../types/model-def";
// import type { ModelRegstry } from "../types/model-registry";
// import { ModifySafeEventDict, SafeEventDict, UpdateSafeEventDict } from "../utils/event";
// import { initAutomicProxy, initReadonlyProxy } from "../utils/proxy";

// export type SpecModelDict<M extends ModelDef> = {
//     [K in KeyOf<ModelDef.ChildDict<M>>]: 
//         InstanceType<ModelRegstry[ModelDef.Code<ModelDef.ChildDict<M>[K]>]>
// }
// export type SpecModelList<M extends ModelDef> = 
//     Array<InstanceType<ModelRegstry[ModelDef.Code<ValueOf<ModelDef.ChildList<M>>>]>>
    

// export abstract class SpecModel<
//     M extends ModelDef = ModelDef
// > extends Model<M> {

//     constructor(config: BaseModelConfig<M>) {
//         super(config);
//     }

// }