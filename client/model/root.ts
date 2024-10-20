import { TmplModelConfig, ModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { BunnyModelDef } from "./bunny";
import { TimerModelDef } from "./timer";
import { GameModelDef } from "./game";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type RootModelDef = TmplModelDef<{
    code: 'root',
    state: {
        progress: number,
    },
    childDict: {
        timer: TimerModelDef,
        game: GameModelDef
    },
    childList: BunnyModelDef[],
    parent: undefined,
    methodDict: {
        spawnCreature: (config: ModelConfig<BunnyModelDef>) => void,
        killCreature: (child: Model<BunnyModelDef>) => void,
    }
}>

@useProduct('root')
export class RootModel extends Model<RootModelDef> {
    protected _effectDict = {};
    
    public readonly methodDict = {
        spawnCreature: this._spawnCreature,
        killCreature: this._killCreature
    };
    
    constructor(config: TmplModelConfig<RootModelDef>) {
        const childList = config.childList || [];
        if (childList.length === 0) {
            childList.push({ code: 'bunny' });
        }
        super({
            ...config,
            state: {
                progress: config.state?.progress || 0
            },
            childDict: {
                timer: config.childDict?.timer || { code: 'timer' },
                game: config.childDict?.game || { code: 'game' }
            },
            childList
        });
    }

    private _spawnCreature(config: ModelConfig<BunnyModelDef>) {
        const child = this._unserialize<BunnyModelDef>(config);
        this._childList.push(child);
        return child;
    }

    private _killCreature(child: Model<BunnyModelDef>) {
        const index = this._childList.indexOf(child);
        if (index >= 0) {
            this._childList.splice(index, 1);
        }
    }

    public prepareGame() {
        const game = this._unserialize<GameModelDef>({
            code: 'game'
        });
        this._childDict.game = game;
        return game;
    }
}
