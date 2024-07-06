// import type { App } from "../app";
// import { BaseData, BaseEvent } from "./base";
// import { 
//     BaseModel, 
//     ChunkOf, 
//     IModelConfig, 
//     ModelChunk, 
//     ModelConfig 
// } from "./model";

// type ListChunk<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseData,
//     S extends BaseData,
//     C extends BaseModel
// > = ModelChunk<M, E, H, R, S> & {
//     children: ChunkOf<C>[]
// }

// type ListConfig<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseData,
//     I extends BaseData,
//     S extends BaseData,
//     C extends BaseModel
// > = ModelConfig<M, E, H, R, I, S> & {
//     children: C[]
// }

// type IListConfig<
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseData,
//     S extends BaseData,
//     C extends BaseModel
// > = IModelConfig<E, H, R, S> & {
//     children?: C[]
// }

// type PureListConfig<
//     C extends BaseModel
// > = {
//     app: App;
//     referId?: string;
//     children: C[]
// }

// export {
//     ListChunk,
//     ListConfig,
//     IListConfig,
//     PureListConfig
// };