
import { SpecModelDef } from "../type/model-def";
import { ModelCode } from "../type/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../type/model";
import { PlayerModelDef } from "./player";

export type GameModelDef = SpecModelDef<{
    code: ModelCode.Game,
    childList: [],
    childDict: {
        redPlayer: PlayerModelDef,
        bluePlayer: PlayerModelDef
    }
}>


export class GameModel extends SpecModel<GameModelDef> {
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
}
