import { 
    BaseEvent, 
    BaseModelDict, 
    BaseModelList, 
    ModelEvent,

    BaseModel
} from "./model";

type ListChunk<L extends BaseModelList> = ChunkOf<L[number]>[];
type DictChunk<D extends BaseModelDict> = { [K in keyof D]: ChunkOf<D[K]> }
type ConsumerChunk<H extends BaseEvent> = { [K in keyof H]?: string[] }
type ProviderChunk<E extends BaseEvent> = { 
    [K in keyof ModelEvent<E>]?: string[] 
}

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
    ReturnType<T['serialize']> : 
    undefined;

export {
    ListChunk,
    DictChunk,
    ConsumerChunk,
    ProviderChunk,

    ChunkOf
};