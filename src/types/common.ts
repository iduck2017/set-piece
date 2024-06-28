import { VoidData } from "./base";
import type { BaseModel } from "./model";

type Refer<
    E extends Record<string, BaseModel[]> 
> = E & {
    checkBefore: BaseModel[];
    updateDone: BaseModel[];
}

type BaseRefer = Refer<Record<string, BaseModel[]>>
type VoidRefer = Refer<VoidData>;

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
    ReturnType<T['serialize']> : 
    undefined;

export { 
    Refer,
    BaseRefer,
    VoidRefer,

    ChunkOf
};