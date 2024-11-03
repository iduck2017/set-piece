import { IModel } from "../model";
import { Base } from "./base";

export type ModelDefine = {
    type: string;
    stateMap: Base.Map;
    referMap: Base.Map;
    childMap: Record<string, IModel>;
    childSet: IModel;
    eventMap: Base.Map;
    parent?: IModel;
}

export type RawModelDefine<
    D extends Partial<ModelDefine>
> = Omit<{
    stateMap: Record<never, never>;
    referMap: Record<never, never>;
    childMap: Record<never, never>; 
    childSet: IModel;
    eventMap: Record<never, never>;
    parent: IModel;
}, keyof D> & D;