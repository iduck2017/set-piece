// import type { App } from "../app";
// import { BaseRecord, BaseEvent } from "./base";
// import { EventId } from "./events";
// import { 
//     BaseModel, 
//     ChunkOf, 
//     IModelConfig, 
//     ModelChunk, 
//     ModelConfig 
// } from "./model";

// type DictChunk<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     S extends BaseRecord,
//     C extends Record<string, BaseModel>
// > = ModelChunk<M, E, H, R, S> & {
//     children: {
//         [K in keyof C]: ChunkOf<C[K]>
//     }
// }

// type DictConfig<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     I extends BaseRecord,
//     S extends BaseRecord,
//     C extends Record<string, BaseModel>
// > = ModelConfig<M, E, H, R, I, S> & {
//     children: C
// }

// type IDictConfig<
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     S extends BaseRecord,
//     C extends Record<string, BaseModel>
// > = IModelConfig<E, H, R, S> & {
//     children?: Partial<C>
// }


// type PureDictConfig<
//     C extends Record<string, BaseModel>
// > = {
//     app: App;
//     referId?: string;
//     children: C
// }

// export {
//     DictChunk,
//     DictConfig,
//     IDictConfig,
//     PureDictConfig
// };