import { VoidData } from "./base";
import type { BaseModel } from "./model";

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
    ReturnType<T['serialize']> : 
    undefined;

type ModelRefer = {
    updateDone?: BaseModel[];
    checkBefore?: BaseModel[];
}


export { 
    ChunkOf,
    ModelRefer
};