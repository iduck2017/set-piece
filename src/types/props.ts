import { Model } from "../model";
import { Value } from ".";

export type Props<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model[]>
> = {
    uuid?: string;
    state?: Partial<Readonly<S1 & S2>>;
    child?: Partial<Readonly<C1 & Record<number, C2>>>;
    refer?: Partial<Readonly<Partial<R1> & R2>>;
}

export type StrictProps<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Model,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model[]>
> = {
    uuid?: string;
    state: Readonly<S1 & S2>;
    child: Readonly<C1 & Record<number, C2>>;
    refer: Readonly<Partial<R1> & R2>
}