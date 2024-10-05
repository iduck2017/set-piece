// import { Model } from "../models";
// import { IBase } from "../type";

// export namespace Decorators {
//     export function usecase() {
//         return function (
//             _target: unknown,
//             _key: string,
//             descriptor: TypedPropertyDescriptor<IBase.Func>
//         ): TypedPropertyDescriptor<IBase.Func> {
//             const original = descriptor.value;
//             descriptor.value = function(
//                 this: Model, 
//                 ...args
//             ) {
//                 this.app.root?.childDict.time.updateTime(1);
//                 return original?.apply(this, args);
//             };
//             return descriptor;
//         };
//     }
// }