import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { GameModelDef } from "./game";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import type { App } from "../app";

export type RootModelDef = TmplModelDef<{
    code: 'root',
    state: {
        progress: number,
    },
    childDict: {
        game: GameModelDef
    },
    parent: App
    actionDict: {
        startGame: () => void
    }
}>


@useProduct('root')
export class RootModel extends Model<RootModelDef> {
    constructor(config: TmplModelConfig<RootModelDef>) {
        super({
            ...config,
            state: {
                progress: config.state?.progress || 0
            },
            childDict: {
                ...config.childDict
            }
        });
        this.debugActionDict = {
            startGame: this._startGame  
        };
    }

    private _startGame = () => {
        this._childDict.game = this._unserialize({ code: 'game' });
        this._childDict.game.actionDict.startGame();
    };
    
    protected readonly _effectDict = {};

    public readonly actionDict = {
        startGame: this._startGame
    };
}
