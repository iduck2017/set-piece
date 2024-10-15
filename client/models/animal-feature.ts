import { SpecModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../types/model";
import type { CastratableModelDef } from "./castratable";
import type { BunnyModel } from "./bunny";

export type AnimalFeaturesModelDef = SpecModelDef<{
    code: ModelCode.AnimalFeatures,
    childDict: {
        castratable?: CastratableModelDef
    },
    parent: BunnyModel 
}>

export class AnimalFeaturesModel extends SpecModel<AnimalFeaturesModelDef> {
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
}
