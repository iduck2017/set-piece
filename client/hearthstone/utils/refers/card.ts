import { CardDef, CardModel } from "@/hearthstone/models/card";
import { PlayerRefer } from "./player";
import { BoardModel } from "@/hearthstone/models/board";
import { DeckModel } from "@/hearthstone/models/deck";
import { HandModel } from "@/hearthstone/models/hand";
import { GraveyardModel } from "@/hearthstone/models/graveyard";
import { PureDef } from "@/set-piece";

export class CardRefer extends PlayerRefer {
    get card(): CardModel<CardDef<PureDef>> | undefined { 
        return this.queryParent<CardModel>(
            undefined, 
            (model) => model.code.startsWith('card')
        ); 
    }

    get board(): BoardModel | undefined { 
        return this.queryParent('board'); 
    }
    
    get deck(): DeckModel | undefined { 
        return this.queryParent('deck'); 
    }

    get hand(): HandModel | undefined { 
        return this.queryParent('hand'); 
    }
    
    get graveyard(): GraveyardModel | undefined { 
        return this.queryParent('graveyard'); 
    }
}
