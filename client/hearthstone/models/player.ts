import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { BoardModel } from "./board";
import { GraveyardModel } from "./graveyard";
import { Def, Factory, NodeModel, Props } from "@/set-piece";
import { PlayerRefer } from "../utils/refers/player";

type PlayerDef = Def.Create<{
    code: 'player',
    stateDict: {},
    paramDict: {},
    childDict: {
        deck: DeckModel,
        hand: HandModel,
        board: BoardModel,
        graveyard: GraveyardModel
    },
    eventDict: {},
}>

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
                ...props.childDict
            },
            stateDict: {},
            paramDict: {}
        });
        this.refer = new PlayerRefer(this);
    }
}