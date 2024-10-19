import { TmplModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { ModelConfig } from "../types/model";
import type { CastratableModelDef } from "./castratable";
import type { BunnyModel } from "./bunny";
import { Model } from ".";

export type AnimalFeaturesModelDef = TmplModelDef<{
    code: ModelCode.AnimalFeatures,
    childDict: {
        castratable?: CastratableModelDef
    },
    parent: BunnyModel 
}>

export class AnimalFeaturesModel extends Model<AnimalFeaturesModelDef> {
    protected _reactDict = {};
 
    constructor(config: ModelConfig<AnimalFeaturesModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {
                castratable: config.childDict?.castratable || {
                    code: ModelCode.Castratable
                }
            }
        });
    }
    
    public readonly intf = {};
}
