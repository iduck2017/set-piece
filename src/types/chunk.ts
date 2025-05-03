import { Model } from "../model";
import { Value } from ".";

export type Chunk<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model[]>,
> = {
    code: string,
    uuid: string;
    state: S1 & S2;
    child: ChildChunk<C1, C2>;
    refer?: ReferChunk<R1, R2>;
}

export type ChildChunk<
    C1 extends Record<string, Model>,
    C2 extends Model,
> = { [K in keyof C1]: 
        C1[K] extends Model ? 
            Model.Chunk<C1[K]> : 
            Model.Chunk<Required<C1>[K]> | undefined 
    } &
    Record<number, Model.Chunk<C2>>

export type ReferChunk<
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model[]>
> = { [K in keyof R1]?: string } &
    { [K in keyof R2]?: Readonly<string[]> }