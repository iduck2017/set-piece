import { ModelConfig } from "../configs/model";
import { ModelCode } from "../configs/model-code";
import { SpecModelDef } from "../configs/model-def";
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