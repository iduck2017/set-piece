import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";
import { ModelConfig, PureModelConfig } from "../configs/model";
import { CastratedModelDef } from "./castrated";

export type FeatureModelDef = 
    CastratedModelDef


export type FeaturesModelDef = SpecModelDef<{
    code: ModelCode.Features,
    childList: FeatureModelDef[]
}>


export class FeaturesModel extends SpecModel<FeaturesModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<FeaturesModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }

    addFeature(feature: PureModelConfig<FeatureModelDef>) {
        this.childList.push(this._unserialize(feature));
    }
}
