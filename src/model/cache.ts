import { Model } from "./model";
import { Value } from "./types";

export type Cache<
    S extends Record<string, Value>,
    D extends Record<string, Value>,
    C extends Record<string, Model>,
    I extends Model,
    R extends Record<string, Model>,
    Q extends Model
> = {
    state: S & D;
    child: C & I[];
    refer: R & Q[];
}