import type { App } from "../app";
import { ModelConfig, PureModelConfig } from "../type/model";
import { SpecModelDef } from "../type/model-def";
import { ModelCode } from "../type/model-code";
import { BunnyModelDef } from "./bunny";
import { SpecModel } from "./specific";
import { TimerModelDef } from "./timer";
import { GameModelDef } from "./game";

export type RootModelDef = SpecModelDef<{
    code: ModelCode.Root,
    info: {
        progress: number,
    },
    childDict: {
        timer: TimerModelDef,
        game?: GameModelDef
    },
    childList: BunnyModelDef[],
    parent: App,
}>

export class RootModel extends SpecModel<RootModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<RootModelDef>) {
        const childList = config.childList || [];
        if (childList.length === 0) {
            childList.push({
                code: ModelCode.Bunny
            });
        }
        super({
            ...config,
            info: {
                progress: config.info?.progress || 0
            },
            childDict: {
                timer: config.childDict?.timer || {
                    code: ModelCode.Timer
                },
                game: config.childDict?.game
            },
            childList
        });
    }

    public spawnCreature(config: PureModelConfig<BunnyModelDef>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }

    public prepareGame() {
        const game = this._unserialize({
            code: ModelCode.Game
        });
        this._childDict.game = game;
        return game;
    }
}
