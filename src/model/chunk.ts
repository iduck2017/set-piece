import { Model } from "./model";
import { Value } from "./types";

export type Chunk<
    S extends Record<string, Value>,
    D extends Record<string, Value>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid?: string;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Model.Chunk<I>[];
    refer?: Partial<ReferAddrs<R>>;
    referGroup?: string[];
}

export type StrictChunk<
    S extends Record<string, Value>,
    D extends Record<string, Value>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid: string;
    state: S & D;
    child: ChildChunk<C>;
    childGroup: Model.Chunk<I>[];
    refer: ReferAddrs<R>;
    referGroup: string[];
}

export type ChildChunk<C extends Record<string, Model>> = C extends C ? { [K in keyof C]: C[K] extends Model ? Model.Chunk<C[K]> : Model.Chunk<Required<C>[K]> | undefined } : never;
export type ReferAddrs<C extends Record<string, Model>> = { [K in keyof C]?: string };
