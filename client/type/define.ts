import { Model } from "../model";
import { Base } from "./base";

export type ModelDefine = {
    type: string;
    stateMap: Base.Data;
    childMap: Record<string, Model>;
    childSet: Model;
    eventMap: Base.Map;
}

export type RawModelDefine<
    D extends Partial<ModelDefine>
> = Omit<{
    stateMap: Record<Base.Key, never>;
    childMap: Record<Base.Key, never>;
    childSet: Model;
    eventMap: Record<Base.Key, never>;
}, keyof D> & D;