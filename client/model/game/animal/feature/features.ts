import { IModel } from "@/model";
import { ModelDefine, RawModelDefine } from "@/type/define";

export type FeaturesDefine = 
    RawModelDefine<{
        type: 'features',
        stateMap: {},
        referMap: {}
    }>

@IModel.useProduct('features')
export class Features extends IModel<
    FeaturesDefine
> {
}