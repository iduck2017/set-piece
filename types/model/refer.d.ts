import { Model } from "./model";
export type ReferGroup<R1 extends Record<string, Model>, R2 extends Record<string, Model>> = {
    [K in keyof R1]?: R1[K];
} & {
    [K in keyof R2]: Array<R2[K] | undefined>;
};
export type ReferAddrs<R1 extends Record<string, Model>, R2 extends Record<string, Model>> = {
    [K in keyof R1]?: [string, string];
} & {
    [K in keyof R2]: Array<[string, string]>;
};
