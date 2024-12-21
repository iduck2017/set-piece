import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { BoardModel } from "./board";
import { GraveyardModel } from "./graveyard";
import { CustomDef, FactoryService, NodeModel, Props } from "@/set-piece";
import { CombativeModel } from "./combative";
import { GameModel } from "./game";
import { RuleService } from "../services/rule";

type PlayerDef = CustomDef<{
    code: 'player',
    stateDict: {},
    paramDict: {},
    childDict: {
        deck: DeckModel,
        hand: HandModel,
        board: BoardModel,
        graveyard: GraveyardModel,
        combative: CombativeModel
    },
    eventDict: {},
    parent: GameModel
}>

@RuleService.useRule({
    combative: {
        health: 30,
        attack: 0,
        races: []
    }
})
@FactoryService.useProduct('player')
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
                combative: { code: 'combative-feature' },
                ...props.childDict
            },
            stateDict: {},
            paramDict: {}
        });
    }
}