
import { TmplModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { ModelConfig } from "../types/model";
import { PlayerModelDef } from "./player";
import { Model } from ".";

export type GameModelDef = TmplModelDef<{
    code: ModelCode.Game,
    childList: [],
    childDict: {
        redPlayer: PlayerModelDef,
        bluePlayer: PlayerModelDef
    }
}>


export class GameModel extends Model<GameModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<GameModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {
                redPlayer: config.childDict?.redPlayer || {
                    code: ModelCode.Player
                },
                bluePlayer: config.childDict?.bluePlayer || {
                    code: ModelCode.Player
                }
            }
        });
    }
    
    public readonly intf = {};
}
