import { Model } from ".";
import { ModelConfig } from "../types/model";
import { TmplModelDef } from "../types/model-def";
import { useProduct } from "../utils/product";

export type PlayerModelDef = TmplModelDef<{
    code: 'player',
}>

@useProduct('player')
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