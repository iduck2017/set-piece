import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { BoardModel } from "./board";
import { GraveyardModel } from "./graveyard";
import { CustomDef, Factory, NodeModel, Props } from "@/set-piece";
import { CombatableModel } from "./combatable";
import { GameModel } from "./game";

type PlayerDef = CustomDef<{
    code: 'player',
    stateDict: {},
    paramDict: {},
    childDict: {
        deck: DeckModel,
        hand: HandModel,
        board: BoardModel,
        graveyard: GraveyardModel,
        combatable: CombatableModel
    },
    eventDict: {},
    parent: GameModel
}>

@CombatableModel.useRule({
    health: 30,
    attack: 0,
    races: []
})
@Factory.useProduct('player')
export class PlayerModel extends NodeModel<PlayerDef> {
    private get _opponent() {
        const { redPlayer, bluePlayer } = this.parent.childDict;
        if (redPlayer === this) return bluePlayer;
        else return redPlayer;
    }

    get referDict() {
        return {
            opponent: this._opponent
        };
    }

    constructor(props: Props<PlayerDef>) {
        super({
            ...props,
            childList: [],
            childDict: {
                deck: { code: 'deck' },
                hand: { code: 'hand' },
                board: { code: 'board' },
                graveyard: { code: 'graveyard' },
                combatable: { code: 'combatable' },
                ...props.childDict
            },
            stateDict: {},
            paramDict: {}
        });
    }
}