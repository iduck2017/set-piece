import { CardDef, CardModel } from "@/hearthstone/models/card";
import { PlayerRefer } from "./player";
import { BoardModel } from "@/hearthstone/models/board";
import { DeckModel } from "@/hearthstone/models/deck";
import { HandModel } from "@/hearthstone/models/hand";
import { GraveyardModel } from "@/hearthstone/models/graveyard";
import { Def } from "@/set-piece";

export class CardRefer extends PlayerRefer {
    get card(): CardModel<CardDef<Def.Pure>> | undefined { 
        return this.queryParent<CardModel>(
            undefined, 
            (model) => model instanceof CardModel
        ); 
    }

    get board() { return this.queryParent(BoardModel); }
    get deck() { return this.queryParent(DeckModel); }
    get hand() { return this.queryParent(HandModel); }
    get graveyard() { return this.queryParent(GraveyardModel); }
}
