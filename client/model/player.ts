import { Model } from ".";
import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { useProduct } from "../utils/decor/product";
import { DeckModelDef } from "./deck";
import { HandModelDef } from "./hand";

export type PlayerModelDef = TmplModelDef<{
    code: 'player',
    childDict: {
        deck: DeckModelDef,
        hand: HandModelDef
    },
    state: {
        curMana: number,
        maxMana: number,
        curManaRecharge: number,
    }
    actionDict: {
        startGame: () => void
    }
}>

@useProduct('player')
export class PlayerModel extends Model<PlayerModelDef> {
    constructor(
        config: TmplModelConfig<PlayerModelDef>
    ) {
        super({
            ...config,
            childDict: {
                ...config.childDict
            },
            state: {
                curMana: 0,
                maxMana: 0,
                curManaRecharge: 0,
                ...config.state
            }
        });
    }

    private readonly _startGame = () => {
        this._childDict.deck = this._unserialize({ code: 'deck' });
        this._childDict.hand = this._unserialize({ code: 'hand' });
        this._childDict.deck.actionDict.initCard();
        this._childDict.hand.actionDict.initCard();
    };

    protected readonly _effectDict = {};

    public readonly actionDict = {
        startGame: this._startGame
    };
}