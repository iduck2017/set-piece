import { TmplModelConfig, ModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { BunnyModelDef } from "./bunny";
import { TimerModelDef } from "./timer";
import { GameModelDef } from "./game";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type RootModelDef = TmplModelDef<{
    code: 'root',
    info: {
        progress: number,
    },
    childDict: {
        timer: TimerModelDef,
        game: GameModelDef
    },
    childList: BunnyModelDef[],
    parent: undefined,
}>

@useProduct('root')
export class RootModel extends Model<RootModelDef> {
    protected _reactDict = {};
    
    constructor(config: TmplModelConfig<RootModelDef>) {
        const childList = config.childList || [];
        if (childList.length === 0) {
            childList.push({ code: 'bunny' });
        }
        super({
            ...config,
            info: {
                progress: config.info?.progress || 0
            },
            childDict: {
                timer: config.childDict?.timer || { code: 'timer' },
                game: config.childDict?.game || { code: 'game' }
            },
            childList
        });
    }

    public spawnCreature(config: ModelConfig<BunnyModelDef>) {
        const child = this._unserialize<BunnyModelDef>(config);
        this._childList.push(child);
        return child;
    }

    public killCreature(child: Model<BunnyModelDef>) {
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

    public readonly recover = () => {
        this._recRecover();
    };

    
    public readonly intf = {};
}
