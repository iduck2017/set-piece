import { Model } from "../model";
import { Base } from "./base";

export type ModelDefine = {
    type: string;
    stateMap: Base.Map;
    referMap: Base.Map;
    childMap: Record<string, Model>;
    childSet: Model;
    eventMap: Base.Map;
    parent?: Model;
}

export type RawModelDefine<
    D extends Partial<ModelDefine>
> = Omit<{
    stateMap: Record<never, never>;
    referMap: Record<never, never>;
    childMap: Record<never, never>; 
    childSet: Model;
    eventMap: Record<never, never>;
    parent: Model;
}, keyof D> & D;