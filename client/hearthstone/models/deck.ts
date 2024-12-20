import { DataBase } from "../services/database";
import { CardDef, CardModel } from "./card";
import { PlayerModel } from "./player";
import { CustomDef, Factory, Model, NodeModel, Props, Validator } from "@/set-piece";

type DeckDef = CustomDef<{
    code: 'deck',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {
        onCardDiscard: [CardModel];
        onCardDraw: [CardModel];
        onCardGenerate: [CardModel];
    },
    parent: PlayerModel
}>

@Factory.useProduct('deck')
export class DeckModel extends NodeModel<DeckDef> {
    constructor(props: Props<DeckDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }

    generateCard<T extends CardModel>(chunk?: Model.Chunk<T>) {
        chunk = chunk ?? DataBase.randomSelect<CardDef>(
            DataBase.cardProductInfo.selectAll
        );
        const target = this.appendChild(chunk);
        if (!target) return;
        this.eventDict.onCardGenerate(target);
        return target;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    discardCard(target?: CardModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        this.eventDict.onCardDiscard(target);
        return chunk;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    drawCard(target?: CardModel) {
        const chunk = this.discardCard(target);
        if (!chunk) return;
        const hand = this.parent.childDict.hand;
        const result = hand.accessCard(chunk);
        if (!result) return;
        this.eventDict.onCardDraw(result);
        return result;
    }
}