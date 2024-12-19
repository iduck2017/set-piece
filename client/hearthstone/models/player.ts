import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { BoardModel } from "./board";
import { GraveyardModel } from "./graveyard";
import { CustomDef, Factory, NodeModel, Props } from "@/set-piece";
import { PlayerRefer } from "../utils/refers/player";
import { CombatableModel } from "./combatable";

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
}>

@CombatableModel.useRule({
    health: 30,
    attack: 0,
    races: []
})
@Factory.useProduct('player')
export class PlayerModel extends NodeModel<PlayerDef> {
    readonly refer: PlayerRefer;

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
        this.refer = new PlayerRefer(this);
    }
}