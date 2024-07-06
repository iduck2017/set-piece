// import { BaseData } from "../types/base";
// import { EventId } from "../types/events";
// import { BaseModel } from "../types/model";
// import { Data } from "./data";

// export class ModelData<
//     R extends BaseData,
//     I extends BaseData,
//     S extends BaseData
// > extends Data<R, I, S, BaseModel> {
//     constructor(
//         config: {
//             rule: R,
//             info: I,
//             stat: S,
//         } 
//     ) {
//         const onCheckBefore = (data: any) => {
//             this.container.provider._emitters[EventId.CHECK_BEFORE](data);
//         };

//         const onUpdateDone = (data: any) => {
//             this.container.provider._emitters[EventId.UPDATE_DONE](data);
//         };

//         super(config, {
//             [EventId.CHECK_BEFORE]: onCheckBefore,
//             [EventId.UPDATE_DONE]: onUpdateDone
//         });
//     }
// }