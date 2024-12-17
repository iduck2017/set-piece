import { Factory } from "@/set-piece/service/factory";
import { Def } from "@/set-piece/type/define";
import { NodeModel } from "../../set-piece/node";
import { Props } from "@/set-piece/type/props";
import { DeckModel } from "./deck";
import { HandModel } from "./hand";
import { BoardModel } from "./board";
import { GraveyardModel } from "./graveyard";
import { GameModel } from "./game";

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
    parent: GameModel
}>

@Factory.useProduct('player')
export class PlayerModel extends NodeModel<PlayerDef> {
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
    }
}