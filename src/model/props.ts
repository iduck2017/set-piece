import { ChildChunk, ReferAddrs } from "./chunk";
import { Model } from "./model";
import { Value } from "./types";

export type Props<
    S extends Record<string, Value>,
    D extends Record<string, Value>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
> = {
    uuid: string;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Model.Chunk<I>[];
    parent: P;
    refer?: Partial<ReferAddrs<R>>;
    referGroup?: string[];
    key?: string;
}

export type StrictProps<
    S extends Record<string, Value>,
    D extends Record<string, Value>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
> = {
    uuid: string;
    state: S & D;
    child: ChildChunk<C>;
    childGroup: Model.Chunk<I>[];
    parent: P;
    refer: ReferAddrs<R>;
    referGroup: string[];
    key?: string;
}