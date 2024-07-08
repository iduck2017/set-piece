import { BaseRecord, ElemOf } from "./base";
import { 
    BaseDict, 
    BaseList, 
    BaseModel
} from "./model";
 
type ListChunk<L extends BaseList> = Array<ChunkOf<ElemOf<L>>>;
type DictChunk<D extends BaseDict> = { [K in keyof D]: ChunkOf<D[K]> }
type ModelRefer<E extends BaseRecord> = { [K in keyof E]?: string[] }

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
        ReturnType<T['serialize']> : 
        undefined;

export {
    ChunkOf,

    ListChunk,
    DictChunk,
    ModelRefer
};