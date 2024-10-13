
import { SpecModelDef } from "../type/model-def";
import { ModelCode } from "../type/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../type/model";

export type GameModelDef = SpecModelDef<{
    code: ModelCode.Game
}>


export class GameModel extends SpecModel<GameModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<GameModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}
