import { ModelConfig } from "../types/model";
import { ModelCode } from "../types/model-code";
import { SpecModelDef } from "../types/model-def";
import { SpecModel } from "./specific";

export type PlayerModelDef = SpecModelDef<{
    code: ModelCode.Player,
}>


export class PlayerModel extends SpecModel<PlayerModelDef> {
    protected _reactDict = {};
    
    constructor(
        config: ModelConfig<PlayerModelDef>
    ) {
        super({
            ...config,
            childDict: {},
            info: {}
        });
    }
}