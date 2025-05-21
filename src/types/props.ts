import { Model } from "../model";
import { Value } from ".";
import { ReferAddrs } from "@/agent/refer";
import { ChildGroup } from "@/agent/child";

export type RawProps<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Record<string, Model>,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    uuid?: string;
    state?: Partial<Readonly<S1 & S2>>;
    child?: Partial<Readonly<ChildGroup<C1, C2>>>;
    refer?: Partial<Readonly<ReferAddrs<R1, R2>>>
}

export type Props<
    S1 extends Record<string, Value>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Record<string, Model>,
    R1 extends Record<string, Model>,
    R2 extends Record<string, Model>
> = {
    uuid?: string;
    state: Readonly<S1 & S2>;
    child: Readonly<ChildGroup<C1, C2>>;
    refer?: Partial<Readonly<ReferAddrs<R1, R2>>>
}