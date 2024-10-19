import { TmplModelDef } from "../types/model-def";
import { ModelConfig } from "../types/model";
import type { CastratableModelDef } from "./castratable";
import type { BunnyModel } from "./bunny";
import { Model } from ".";
import { useProduct } from "../utils/product";

export type AnimalFeaturesModelDef = TmplModelDef<{
    code: 'animal_features',
    childDict: {
        castratable?: CastratableModelDef
    },
    parent: BunnyModel 
}>

@useProduct('animal_features')
export class AnimalFeaturesModel extends Model<AnimalFeaturesModelDef> {
    protected _reactDict = {};
 
    constructor(config: ModelConfig<AnimalFeaturesModelDef>) {
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
