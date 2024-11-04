import { IModel } from "@/model";
import { ModelDefine, RawModelDefine } from "@/type/define";

export type IFeatureDefine = 
    RawModelDefine<{
        type: string,
        stateMap: {
            name: string,
            desc: string,
        },
        referMap: {}
    }>

export abstract class IFeature<
    D extends ModelDefine = any
> extends IModel<
    IFeatureDefine & D
> {
}