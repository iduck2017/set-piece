
import { TmplModelDef } from "../types/model-def";
import { ModelConfig } from "../types/model";
import { PlayerModelDef } from "./player";
import { Model } from ".";
import { useProduct } from "../utils/product";

export type GameModelDef = TmplModelDef<{
    code: 'game',
    childList: [],
    childDict: {
        redPlayer: PlayerModelDef,
        bluePlayer: PlayerModelDef
    }
}>

@useProduct('game')
export class GameModel extends Model<GameModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<GameModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {
                redPlayer: config.childDict?.redPlayer || {
                    code: 'player'
                },
                bluePlayer: config.childDict?.bluePlayer || {
                    code: 'player'
                }
            }
        });
    }
    
    public readonly intf = {};
}
