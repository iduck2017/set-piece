import { IModel } from "../model";
import { Base } from "./base";

export type ModelDefine = {
    type: string;
    stateMap: Base.Map;
    referMap: Base.Map;
    childMap: Record<string, IModel | undefined>;
    childSet: IModel;
    eventMap: Base.Map;
    parent?: IModel;
}

export type RawModelDefine<
    D extends Partial<ModelDefine>
> = Omit<{
    stateMap: Record<Base.Key, never>;
    referMap: Record<Base.Key, never>;
    childMap: Record<Base.Key, never>; 
    childSet: IModel;
    eventMap: Record<Base.Key, never>;
    parent: IModel;
}, keyof D> & D;