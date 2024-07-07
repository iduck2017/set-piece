// import type { App } from "../app";
// import { BaseRecord, BaseEvent } from "./base";
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
//     R extends BaseRecord,
//     S extends BaseRecord,
//     C extends BaseModel
// > = ModelChunk<M, E, H, R, S> & {
//     children: ChunkOf<C>[]
// }

// type ListConfig<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     I extends BaseRecord,
//     S extends BaseRecord,
//     C extends BaseModel
// > = ModelConfig<M, E, H, R, I, S> & {
//     children: C[]
// }

// type IListConfig<
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     S extends BaseRecord,
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