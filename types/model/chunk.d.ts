import { ReferAddrs } from "./refer";
import { Model } from "./model";
import { Value } from "./types";
export type Chunk<I extends string, S1 extends Record<string, Value>, S2 extends Record<string, Value>, C1 extends Record<string, Model>, C2 extends Model, R1 extends Record<string, Model>, R2 extends Record<string, Model>> = {
    code: I;
    uuid?: string;
    state?: Partial<S1 & S2>;
    child?: Partial<FlatChildChunk<C1, C2>>;
    refer?: ReferAddrs<R1, R2>;
};
export type StrictChunk<I extends string, S1 extends Record<string, Value>, S2 extends Record<string, Value>, C1 extends Record<string, Model>, C2 extends Model, R1 extends Record<string, Model>, R2 extends Record<string, Model>> = {
    code: I;
    uuid: string;
    state: S1 & S2;
    child: FlatChildChunk<C1, C2>;
    refer?: ReferAddrs<R1, R2>;
};
export type FlatChildChunk<C1 extends Record<string, Model>, C2 extends Model> = C1 extends C1 ? {
    [K in keyof C1]: C1[K] extends Model ? Model.Chunk<C1[K]> : Model.Chunk<Required<C1>[K]> | undefined;
} & Record<number, Model.Chunk<C2>> : never;
export type ChildChunk<C1 extends Record<string, Model>, C2 extends Model> = C1 extends C1 ? {
    [K in keyof C1]: C1[K] extends Model ? Model.Chunk<C1[K]> : Model.Chunk<Required<C1>[K]> | undefined;
} & Model.Chunk<C2>[] : never;
