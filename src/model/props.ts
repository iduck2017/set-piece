import { ReferAddrs } from "./refer";
import { FlatChildChunk } from "./chunk";
import { Model } from "./model";
import { Value } from "./types";

export type Props<
    I extends string,
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    code: I;
    uuid: string;
    path: string;
    state?: Partial<S1 & S2>;
    child?: Partial<FlatChildChunk<C1, C2>>;
    refer?: ReferAddrs<R1, R2>;
    parent: P;
}

export type StrictProps<
    I extends string,
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    P extends Model | undefined,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    code: I;
    uuid: string;
    path: string;
    state: S1 & S2;
    child: FlatChildChunk<C1, C2>;
    refer: ReferAddrs<R1, R2>;
    parent: P;
}