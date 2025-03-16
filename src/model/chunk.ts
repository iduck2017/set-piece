import { ReferAddrs } from "./child";
import { Model } from "./model";
import { Value } from "./types";

export type Chunk<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid?: string;
    state?: Partial<S1 & S2>;
    child?: Partial<ChildChunk<C1, C2>> & Model.Chunk<C2>[];
    refer?: ReferAddrs<R1, R2>;
}

export type StrictChunk<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid: string;
    state: S1 & S2;
    child: ChildChunk<C1, C2>;
    refer?: ReferAddrs<R1, R2>;
}

export type ChildChunk<
    C1 extends Record<string, Model>,
    C2 extends Model,
> = C1 extends C1 ? { 
    [K in keyof C1]: C1[K] extends Model ? Model.Chunk<C1[K]> : Model.Chunk<Required<C1>[K]> | undefined 
} & Model.Chunk<C2>[] : never;
