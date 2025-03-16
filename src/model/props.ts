import { ReferAddrs } from "./child";
import { ChildChunk } from "./chunk";
import { Model } from "./model";
import { Value } from "./types";

export type Props<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    uuid: string;
    state?: Partial<S1 & S2>;
    child?: Partial<ChildChunk<C1, C2>> & Model.Chunk<C2>[];
    refer?: ReferAddrs<R1, R2>;
    key: string | undefined;
    parent: P;
}

export type StrictProps<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    uuid: string;
    state: S1 & S2;
    child: ChildChunk<C1, C2>;
    refer?: ReferAddrs<R1, R2>;
    key: string | undefined;
    parent: P;
}