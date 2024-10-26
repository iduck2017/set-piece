// import { Model } from "../../model";
// import { FactoryService } from "../../service/factory";
// import { BaseModelConfig } from "../../type/model/config";
// import { ModelDef } from "../../type/model/define";

// export function useProduct<M extends ModelDef>(key: ModelDef.Code<M>) {
//     return function (
//         target: new (config: BaseModelConfig<M>) => Model<M>
//     ) {
//         FactoryService.register(key, target);
//     };
// }