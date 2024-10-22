import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { GameModelDef } from "./game";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type RootModelDef = TmplModelDef<{
    code: 'root',
    state: {
        progress: number,
    },
    childDict: {
        game: GameModelDef
    },
    childList: [],
    parent: undefined,
    actionDict: {
    }
}>

@useProduct('root')
export class RootModel extends Model<RootModelDef> {
    protected readonly _effectDict = {};
    public readonly actionDict = {
    };
    
    constructor(config: TmplModelConfig<RootModelDef>) {
        super({
            ...config,
            state: {
                progress: config.state?.progress || 0
            },
            childDict: {
                game: config.childDict?.game || { code: 'game' }
            },
            childList: []
        });
    }

    private _prepareGame() {
        const game = this._unserialize<GameModelDef>({
            code: 'game'
        });
        this._childDict.game = game;
        return game;
    }
}
