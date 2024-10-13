import { ModelConfig } from "../configs/model";
import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { Random } from "../utils/random";
import { SpecModel } from "./specific";

export type BunnyModelDef = SpecModelDef<{
    code: ModelCode.Bunny,
    info: {
        curAge: number,
        maxAge: number,
    },
    reactDict: {
        timeUpdateDone: void,
    }
}>

export class BunnyModel extends SpecModel<BunnyModelDef> {
   
    constructor(config: ModelConfig<BunnyModelDef>) {
        super({
            ...config,
            childDict: {},
            info: {
                curAge: config.info?.curAge || 0,
                maxAge: config.info?.maxAge ||  Random.number(-25, 25) + 100
            }
        });
        this.apiDict = {
            spawnChild: this.spawnChild
        };
    }

    protected readonly _activate = () => {
        const timer = this.app.root.childDict.timer;
        timer.eventDict.timeUpdateDone.bindReact(
            this._reactDict.timeUpdateDone
        );
    };

    /** 繁殖幼崽 */
    public readonly spawnChild = () => {
        this.app.root.spawnCreature({
            code: ModelCode.Bunny
        });
    };

    /** 年龄增长 */
    private readonly _handleTimeUpdateDone = () => {
        this._originInfo.curAge += 1;
    };

    protected _reactDict = this._initReactDict({
        timeUpdateDone: this._handleTimeUpdateDone
    });
}