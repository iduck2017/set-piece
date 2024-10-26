// import { KeyOf } from "..";
// import type { App } from "../../app";
// import type { Model } from "../../model";
// import { ModelDef } from "./define";

// // 基础模型初始化参数
// export type ModelConfig<D extends ModelDef> = Readonly<{
//     id?: string,
//     app: App,
//     code: ModelDef.Code<D>,
//     state: ModelDef.State<D>,
//     parent: Model.Parent<D>,
//     childList?: ModelConfig.ChildList<D>,
//     childDict?: ModelConfig.ChildDict<D>,
// }>

// export namespace ModelConfig {
//     export type ChildList<D extends ModelDef> = Array<
//         BaseModelConfig<ModelDef.ChildItem<D>>
//     >
//     // export type ChildDict<D extends ModelDef> = {
//     //     [K in KeyOf<ModelDef.ChildDict<D>>]:
//     //         ModelDef.ChildDict<D>[K] extends Required<ModelDef.ChildDict<D>>[K] ?
//     //             BaseModelConfig<Required<ModelDef.ChildDict<D>[K]>> : 
//     //             BaseModelConfig<Required<ModelDef.ChildDict<D>[K]>> | undefined
//     // }
//     export type ChildDict<D extends ModelDef> = {
//         [K in KeyOf<ModelDef.ChildDict<D>>]?:
//             BaseModelConfig<ModelDef.ChildDict<D>[K]>
//     }
// }


// // 模型初始化对象
// export type BaseModelConfig<D extends ModelDef> = Readonly<{
//     id?: string
//     code: ModelDef.Code<D>
//     state?: Partial<ModelDef.State<D>>
//     childList?: ModelConfig.ChildList<D>,
//     childDict?: ModelConfig.ChildDict<D>,
// }>

// // 泛型模型初始化对象
// export type TmplModelConfig<D extends ModelDef> =  
//     BaseModelConfig<D> &
//     Readonly<{
//         app: App,
//         parent: any,
//     }>

