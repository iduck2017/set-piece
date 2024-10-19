import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import type { CastratableModelDef } from "./castratable";
import type { BunnyModel } from "./bunny";
import { Model } from ".";
import { useProduct } from "../utils/product";

export type AnimalFeaturesModelDef = TmplModelDef<{
    code: 'animal_features',
    childDict: {
        castratable: CastratableModelDef
    },
    parent: BunnyModel 
}>

@useProduct('animal_features')
export class AnimalFeaturesModel extends Model<AnimalFeaturesModelDef> {
    protected _reactDict = {};
 
    constructor(config: TmplModelConfig<AnimalFeaturesModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {
                castratable: config.childDict?.castratable || {
                    code: 'castratable'
                }
            }
        });
    }
    
    public readonly intf = {};
}
