import { Model } from ".";
import { ModelConfig } from "../types/model";
import { ModelCode } from "../types/model-code";
import { TmplModelDef } from "../types/model-def";

export type PlayerModelDef = TmplModelDef<{
    code: ModelCode.Player,
}>


export class PlayerModel extends Model<PlayerModelDef> {
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
    
    public readonly intf = {};
}