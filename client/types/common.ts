import { 
    BaseEvent, 
    BaseDict, 
    BaseList, 
    BaseModel,
    BaseTmpl
} from "./model";

type ListChunk<L extends BaseList> = ChunkOf<L[number]>[];
type DictChunk<D extends BaseDict> = { [K in keyof D]: ChunkOf<D[K]> }
type EventChunk<H extends BaseEvent> = { [K in keyof H]?: string[] }

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
        ReturnType<T['serialize']> : 
        undefined;

type UnionOf<
    A extends Partial<BaseTmpl>,
    B extends BaseTmpl
> = A & Omit<B, keyof A>;

export {
    ChunkOf,
    UnionOf,

    ListChunk,
    DictChunk,
    EventChunk
};