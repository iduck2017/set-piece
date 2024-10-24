
import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { PlayerModelDef } from "./player";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Random } from "../utils/random";

export enum GamePlayer {
    PlayerA = 'playerA',
    PlayerB = 'playerB',
}

export type GameModelDef = TmplModelDef<{
    code: 'game',
    childList: [],
    state: {
        curRound: number,
        curPlayer: GamePlayer,
    }
    childDict: {
        playerA: PlayerModelDef,
        playerB: PlayerModelDef
    },
    signalDict: {
        gameStartPre: void,
        gameStartPost: void,
    }
    actionDict: {
        startGame: () => void,
    }
}>

@useProduct('game')
export class GameModel extends Model<GameModelDef> {

    constructor(config: TmplModelConfig<GameModelDef>) {
        super({
            ...config,
            state: {
                curRound: 0,
                curPlayer: Random.type(
                    GamePlayer.PlayerA,
                    GamePlayer.PlayerB
                ),
                ...config.state
            },
            childDict: {
                ...config.childDict
            }
        });
    }

    private readonly _startGame = () => {
        this._signalDict.gameStartPre.emitEvent();
        this._childDict.playerA = this._unserialize({ code: 'player' });
        this._childDict.playerB = this._unserialize({ code: 'player' });
        this._childDict.playerA.actionDict.startGame();
        this._childDict.playerB.actionDict.startGame();
        this._signalDict.gameStartPost.emitEvent();
    };
    
    protected readonly _effectDict = this.EffectDict({});

    public readonly actionDict = {
        startGame: this._startGame
    };
}
