import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import type { CastratableModelDef } from "./castratable";
import type { BunnyModelDef } from "./bunny";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type AnimalFeaturesModelDef = TmplModelDef<{
    code: 'animal_features',
    childDict: {
        castratable: CastratableModelDef
    },
    parent: BunnyModelDef
}>

@useProduct('animal_features')
export class AnimalFeaturesModel extends Model<AnimalFeaturesModelDef> {
    protected _effectDict = {};
 
    constructor(config: TmplModelConfig<AnimalFeaturesModelDef>) {
        super({
            ...config,
            state: {},
            childDict: {
                castratable: config.childDict?.castratable || {
                    code: 'castratable'
                }
            }
        });
    }
    
    public readonly methodDict = {};
}
